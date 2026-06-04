import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler

from Injury_risk_prediction.src.utils import DATA_PATH


def load_data(data_path):
    df = pd.read_csv(data_path)

    # sort data 
    df['date'] = pd.to_datetime(df['date'])  # formating date data into datetime
    df = df.sort_values(['user_id', "date"])
    df = df.drop(columns=["sleep_performance"]) # drop constant feature
    return df 



def output_labelling(df):
    
    def create_injury_label(row):
        if row["day_strain"] > 15 and row["recovery_score"] < 40:
            return 1
        if row["recovery_score"] < 20 and row["hrv"] < 20:
            return 1
        if row["day_strain"] > 19:
            return 1
        return 0 
    

    df['injury_label'] = df.apply(create_injury_label, axis=1)  # apply create_injury_label across each row in df
    df['injury_label'] = df.groupby('user_id')['injury_label'].shift(-1)   # shift target variable backwards by 1 (use today's features to predict tomorrow's injury label)
    df = df.dropna()   # then droping rows that have 'injury_label' missing (due to shifting cuz 1 vacent from each 'user_id')
    return df   






# Lag Features: Create features from the previous days to capture trends.
def lag_features(df):
    windows = [7, 14, 28]
    metrics = ['day_strain', 'hrv', 'sleep_hours', 'resting_heart_rate']

    for window in windows:
        for metric in metrics:

            df[f"{metric}_roll_mean_{window}"] = df.groupby('user_id')[metric].transform(lambda x: x.rolling(window=window, min_periods=1).mean() )
            df[f"{metric}_roll_std_{window}"] = df.groupby('user_id')[metric].transform(lambda x: x.rolling(window=window, min_periods=1).std() )


    # Rate of Change : Calculate the day-over-day change for key metrics.
    for metric in metrics:
        df[f"{metric}_roc"] = df.groupby('user_id')[metric].pct_change()  # percentage rate of change
        df[f"{metric}_roc"] = df[f"{metric}_roc"].replace([np.inf, -np.inf, np.nan], 0)

    return df   




def composite_Acute_Cronic_Workload(df):

    # Normalize each metric to 0-1 scale

    scaler = MinMaxScaler()
    df['strain_norm'] = scaler.fit_transform(df[['day_strain']])
    df['hrv_inverse_norm'] = 1 - scaler.fit_transform(df[['hrv']])  # low HRV = high load
    df['sleep_deficit_norm'] = 1 - scaler.fit_transform(df[['sleep_hours']]) / 8

    # Composite load (weights based on domain knowledge)
    df['daily_load'] = (0.6 * df['strain_norm'] + 
                        0.3 * df['hrv_inverse_norm'] + 
                        0.1 * df['sleep_deficit_norm'])

    # Then compute ACWR on 'daily_load'
    acute = df.groupby('user_id')['daily_load'].transform(lambda x: x.rolling(7, min_periods=1).mean())
    chronic = df.groupby('user_id')['daily_load'].transform(lambda x: x.rolling(28, min_periods=1).mean())
    df['acwr_composite'] = acute / (chronic + 1e-6)

    return df



# Apply cyclical encoding (sine/cosine transformation)
def encode_cyclical(data, col, max_val):
    data[f'{col}_sin'] = np.sin(2 * np.pi * data[col] / max_val)
    data[f'{col}_cos'] = np.cos(2 * np.pi * data[col] / max_val)
    return data


def date_processing(df):

    df['day_of_week'] = df['date'].dt.dayofweek  
    df['month'] = df['date'].dt.month
    df['day_of_month'] = df['date'].dt.day  
    df['weekend'] = (df['date'].dt.dayofweek >= 5).astype(int)

    # Cyclical encoding for day_of_week and month. December (11) and January (0) will have coordinates very close to each other on the circle. 
    df = encode_cyclical(df, col="day_of_week", max_val=7)
    df = encode_cyclical(df, col="month", max_val=12)
    
    # Then drop the original 'date'
    df = df.drop(columns=['date'])

    return df  



def workout_time_of_day_processing(df):

    df['workout_time_of_day'] = df['workout_time_of_day'].fillna('Unknown')

    # First, map your categories to a numeric hour
    time_map = {'Morning': 8, 'Afternoon': 14, 'Evening': 19, 'Unknown': 12}
    df['hour_of_day'] = df['workout_time_of_day'].map(time_map)

    # Encode the hour (max_val is 24)
    df = encode_cyclical(df, 'hour_of_day', 24)

    # drop the intermediate 'hour_of_day' column
    df = df.drop(columns=['hour_of_day', 'workout_time_of_day'])

    return df 



# categorical columns label encoding performing
def categorical_label_encoding(df):

    categorical_cols = ['gender', 'fitness_level', 'primary_sport', 'activity_type']

    # lightgbm and xgboost can handle categorical columns so converting it into pandas category
    for col in categorical_cols:
        df[col] = df[col].astype('category')
    
    return df 



def feature_engineering():
    
    df = load_data(DATA_PATH)
    df = output_labelling(df)
    df = lag_features(df)
    df = composite_Acute_Cronic_Workload(df)
    df = date_processing(df)
    df = workout_time_of_day_processing(df)
    df = categorical_label_encoding(df)
    
    return df 


if __name__ == '__main__':

    df = feature_engineering()
    print(df)

