import mlflow
import optuna
from evaluate import evaluate_model
from features import feature_engineering
from lightgbm import LGBMClassifier
from mlflow.tracking import MlflowClient
from sklearn.model_selection import (GroupKFold, GroupShuffleSplit, cross_val_score)
from utils import CV_FOLDS, N_TRAILS
from xgboost import XGBClassifier


def setup_mlflow():
    mlflow.set_tracking_uri(uri="sqlite:///mlflow.db")
    mlflow.set_experiment(experiment_name="Injury_Risk_Prediction")



def train_test_data(df):
    
    X = df.drop(columns=['injury_label'])
    y = df['injury_label']
    groups = df['user_id'] 

    # n_splits=1 because we just want one final holdout set, not cross-validation here
    gss = GroupShuffleSplit(n_splits=1, test_size=0.2, random_state=42)

    # Generate the indices for the split
    train_idx, test_idx = next(gss.split(X, y, groups))

    # Slice the dataframe using the generated indices
    X_train = X.iloc[train_idx]
    X_test = X.iloc[test_idx]
    y_train = y.iloc[train_idx]
    y_test = y.iloc[test_idx]

    return X_train, X_test, y_train, y_test



def class_count_ratio(y_train):

    neg_count = (y_train == 0).sum()
    pos_count = (y_train == 1).sum()

    scale_pos_weight = neg_count / pos_count
    print(f"Negative: {neg_count}, Positive: {pos_count}, Ratio: {scale_pos_weight:.2f}") 
    return scale_pos_weight   # by this value scaled the positive class to give equal weightage to both class even though pos class in minority





def cv_score(model, X, y, cv_folds=5):
    
    gkf = GroupKFold(n_splits=cv_folds)
    groups = X['user_id']
    X = X.drop(columns=['user_id'])
    scores = cross_val_score(estimator=model, X=X, y=y, cv=gkf, groups=groups, scoring='roc_auc')  
    return scores.mean()


def objective_xgb(trial, X, y, cv_folds, scale_pos_weight):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 50, 350, step=50),
        'max_depth': trial.suggest_int('max_depth', 1, 15),
        'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3, log=True),
        'subsample': trial.suggest_float('subsample', 0.5, 1.0),
        'colsample_bytree': trial.suggest_float('colsample_bytree', 0.5, 1.0),
        'min_child_weight': trial.suggest_int('min_child_weight', 1, 15),
        'gamma': trial.suggest_float('gamma', 0, 5),
        'reg_alpha': trial.suggest_float('reg_alpha', 1e-8, 10.0, log=True),
        'reg_lambda': trial.suggest_float('reg_lambda', 1e-3, 10.0, log=True),
        "tree_method": "hist",  
    }
    
    model = XGBClassifier(**params, random_state=42, verbosity=0, scale_pos_weight=scale_pos_weight, device='cuda', enable_categorical=True)
    score = cv_score(model, X, y, cv_folds)

    return score 


def objective_lgbm(trial, X, y, cv_folds, scale_pos_weight):
    params = {
        'n_estimators': trial.suggest_int('n_estimators', 50, 350, step=50),
        'max_depth': trial.suggest_int('max_depth', 1, 10),
        'learning_rate': trial.suggest_float('learning_rate', 0.01, 0.3, log=True),
        'bagging_fraction': trial.suggest_float('bagging_fraction', 0.5, 1.0),
        'feature_fraction': trial.suggest_float('feature_fraction', 0.5, 1.0),
        'min_child_samples': trial.suggest_int('min_child_samples', 1, 100),
        'reg_alpha': trial.suggest_float('reg_alpha', 1e-8, 10.0, log=True),
        'reg_lambda': trial.suggest_float('reg_lambda', 1e-4, 10.0, log=True),
        'num_leaves': trial.suggest_int('num_leaves', 10, 100),
        'min_split_gain': trial.suggest_float('min_split_gain', 0, 1),            
    }

    model = LGBMClassifier(**params, random_state=42, verbose=-1, scale_pos_weight=scale_pos_weight, device='gpu')
    score = cv_score(model, X, y, cv_folds)

    return score



def tune_with_optuna(X_train, y_train, model_name, cv_folds, scale_pos_weight, n_trials=50):

    X = X_train
    y = y_train
    
    objectives ={
        "XGBoost": objective_xgb,
        "LightGBM": objective_lgbm
    }

    study = optuna.create_study(direction='maximize', sampler=optuna.samplers.TPESampler(seed=42))

    study.optimize(lambda trail: objectives[model_name](trial=trail, X=X, y=y, cv_folds=cv_folds, scale_pos_weight=scale_pos_weight), 
                   n_trials=n_trials, show_progress_bar=True, n_jobs=-1)

    best_params = study.best_params
    best_value = study.best_value
    
    with mlflow.start_run(run_name=f"Optuna_tune '{model_name}'", nested=True):
        mlflow.log_params({"model_name": model_name, "X_train_shape":X_train.shape, "best_params": best_params, "all_features": ",".join(X_train.columns)})
        mlflow.log_metrics({'best_auc_roc':best_value, "best_trial_number":study.best_trial.number})
        mlflow.log_table(study.trials_dataframe(), artifact_file='cv_trail_history.json')

        return {"model_name": model_name, "best_value": best_value, "best_params": best_params}



def train_model(model_name, X, y, params, scale_pos_weight):
    
    models = {"LightGBM":LGBMClassifier, "XGBoost":XGBClassifier}
    params['scale_pos_weight'] = scale_pos_weight

    model_class = models[model_name]
    if model_name == 'XGBoost':
        model = model_class(**params, random_state=42, enable_categorical=True)
        X = X.drop(columns=['user_id'])
        model.fit(X, y)
    else:
        model = model_class(**params, random_state=42)
        X = X.drop(columns=['user_id'])
        model.fit(X, y)    

     
    model_info = mlflow.sklearn.log_model(sk_model = model, name = model_name, registered_model_name= model_name, input_example = X.iloc[20:21, :], params=params)
    client = MlflowClient()
    client.set_registered_model_alias(name=model_name, alias="challenger", version= model_info.registered_model_version)                                       
     


def train_pipeline(model_name='LightGBM'):

    print(f"[FEATURE]") 
    df = feature_engineering()

    setup_mlflow()

    with mlflow.start_run(run_name=f"{model_name}_training"):
    
        print(f"[DATA SPLITTING]")
        X_train, X_test, y_train, y_test = train_test_data(df)
        
        print(f"[SCALE WEIGHT]")
        scale_pos_weight = class_count_ratio(y_train) 
        
        print(f"[OPTUNA]")
        result = tune_with_optuna(X_train, y_train, model_name=model_name, cv_folds=CV_FOLDS, scale_pos_weight=scale_pos_weight, n_trials=N_TRAILS)
        
        print(f"[TRAIN & SAVE]")
        train_model(model_name, X=X_train, y=y_train, params=result['best_params'], scale_pos_weight=scale_pos_weight)  
        
        print(f"[EVALUATE]")
        evaluate_model(model_name=model_name, X_test=X_test, y_test=y_test)


if __name__ == "__main__":
 
    train_pipeline(model_name="LightGBM")  
