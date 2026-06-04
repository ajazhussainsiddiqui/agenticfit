import joblib
import mlflow
from features import feature_engineering
from mlflow import MlflowClient
from sklearn.metrics import (confusion_matrix, precision_score, recall_score,
                             roc_auc_score)
from sklearn.model_selection import GroupShuffleSplit


def compare_promote_save_model(model_name, challenger_score):

    client = MlflowClient()
    reg_model_name = f"{model_name}"

    def save_production_model_locally(model_name):  # save model from mlflow
     
        model_uri = f"models:/{model_name}@champion" 

        model = mlflow.sklearn.load_model(model_uri)

        joblib.dump(value=model, filename=f"models/{model_name}.pkl")
        print(f"CHAMPION model'{model_name}' fetched from MLflow and save locally in '/models'")    
        return model
 

    try:
        champion_version = client.get_model_version_by_alias(name=reg_model_name, alias="champion")
        champion_run = client.get_run(run_id=champion_version.run_id)   
        champion_score =champion_run.data.metrics.get("auc_score", 0.0)
        print(f"Current '@champion' version {champion_version.version} score: {champion_score}")           
    except Exception:
        print(f"No existing '@champion' version found for model {reg_model_name}")
        champion_score = 0.0
    
    if challenger_score > champion_score:
        print(f"WIN...! Challenger ({challenger_score}) beat Champion ({champion_score}) in auc_score")

        challenger_version = client.get_model_version_by_alias(name=reg_model_name, alias="challenger") 
        
        client.set_registered_model_alias(name=reg_model_name, alias="champion", version=challenger_version.version) 
        print(f"Version {challenger_version.version} promoted to @champion ")
        
        save_production_model_locally(model_name= reg_model_name)
    else:
        print(f"LOSS...! Challenger ({challenger_score}) Did NOT beat Champion ({champion_score}) in nasa_score")



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



def load_model_form_mlflow(model_name):
     
    model_uri = f"models:/{model_name}@challenger"
    print(f"Fetching '{model_uri}' from MLflow Registry...")
    model = mlflow.sklearn.load_model(model_uri)
    return model  



def evaluate_model(model_name, X_test, y_test):

    model = load_model_form_mlflow(model_name=model_name)

    X_test = X_test.drop(columns=['user_id']) 
    y_pred = model.predict(X_test)
    
    auc_value = roc_auc_score(y_true=y_test, y_score=y_pred)
    recall_value = recall_score(y_true=y_test, y_pred=y_pred)
    precision_value = precision_score(y_true=y_test, y_pred=y_pred)
    Confusion_matrix = confusion_matrix(y_test, y_pred)
    

    print(f"RECALL SCORE: {recall_value}")
    print(f"PRECISION SCORE: {precision_value}")
    print(f"AUC SCORE: {auc_value}") 
    
    print("Confusion Matrix: ")
    print(Confusion_matrix)
    
    if mlflow.active_run() is not None:
        mlflow.log_metrics(metrics={'recall_score': recall_value, 'precision_score':precision_value, 'auc_score':auc_value})

    compare_promote_save_model(model_name=model_name, challenger_score=auc_value)    


if __name__ == "__main__":

    df = feature_engineering()
    X_train, X_test, y_train, y_test = train_test_data(df)    

    evaluate_model(model_name="LightGBM", X_test=X_test, y_test=y_test)
