import random
from datetime import date

import pandas as pd
from dateutil.relativedelta import relativedelta
import os, sys
import joblib


current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from db.crud_db import daily_logs, health_metrics
from Injury_risk_prediction.src.features import (categorical_label_encoding, composite_Acute_Cronic_Workload,
                                                date_processing, lag_features, workout_time_of_day_processing)


def get_data(metrics, logs_df):

    """
    WARNING: Experimental inference. 
    Some physiological features are approximated because, does not yet collect sleep-stage-level data and some other signal. 
    See README.md for planned data pipeline.
    """
    
    #  Individual columns from logs_df
    date_col              = logs_df['created_at']
    day_of_week           = logs_df['created_at'].dt.day_name()
    recovery_score        = logs_df['recovery_score']
    day_strain            = logs_df['day_strain']
    sleep_hours           = logs_df['sleep_hours']
    hrv                   = logs_df['hrv']
    workout_completed     = logs_df['workout_completed']
    activity_duration_min = logs_df['workout_duration_min']
    activity_strain       = logs_df['day_strain']
    activity_calories     = logs_df['calories_burned']
    calories_burned       = logs_df['calories_burned']
    
    #  Constants 
    activity = ['Rest Day', 'Weight Training', 'Running', 'Yoga', 'CrossFit', 'Cycling', 'Walking', 'HIIT', 'Swimming']

    user_id              = metrics.get('user_email')
    activity_type        = random.choice(activity)
    primary_sport        = random.choice(activity)
    age                  = relativedelta(date.today(), metrics.get('date_of_birth')).years
    gender               = metrics.get('gender')
    weight_kg            = metrics.get('weight_kg')
    height_cm            = metrics.get('height_cm')
    fitness_level        = metrics.get('experience_level')
    sleep_efficiency     = random.randint(80, 95)
    sleep_performance    = 100
    light_sleep_hours    = 4.5
    rem_sleep_hours      = 1.8
    deep_sleep_hours     = 1.3
    wake_ups             = 0
    time_to_fall_asleep_min = 5
    resting_heart_rate   = 58
    hrv_baseline         = 80
    rhr_baseline         = 55
    respiratory_rate     = 15
    skin_temp_deviation  = 0.01
    avg_heart_rate       = 125
    max_heart_rate       = 145
    hr_zone_1_min        = 8
    hr_zone_2_min        = 10
    hr_zone_3_min        = 15
    hr_zone_4_min        = 15
    hr_zone_5_min        = 5          
    workout_time_of_day  = 'Morning'

    # --- Build DataFrame ---
    n = len(logs_df)

    df = pd.DataFrame({
        'date': date_col,
        'day_of_week': day_of_week,
        'recovery_score': recovery_score,
        'day_strain': day_strain,
        'sleep_hours': sleep_hours,
        'hrv': hrv,
        'workout_completed': workout_completed,
        'activity_duration_min': activity_duration_min,
        'activity_strain': activity_strain,
        'activity_calories': activity_calories,
        'user_id': [user_id] * n,
        'activity_type': [activity_type] * n,
        'primary_sport': [primary_sport] * n,
        'age': [age] * n,
        'gender': [gender] * n,
        'weight_kg': [weight_kg] * n,
        'height_cm': [height_cm] * n,
        'fitness_level': [fitness_level] * n,
        'sleep_efficiency': [sleep_efficiency] * n,
        'sleep_performance': [sleep_performance] * n,
        'light_sleep_hours': [light_sleep_hours] * n,
        'rem_sleep_hours': [rem_sleep_hours] * n,
        'deep_sleep_hours': [deep_sleep_hours] * n,
        'wake_ups': [wake_ups] * n,
        'time_to_fall_asleep_min': [time_to_fall_asleep_min] * n,
        'resting_heart_rate': [resting_heart_rate] * n,
        'hrv_baseline': [hrv_baseline] * n,
        'rhr_baseline': [rhr_baseline] * n,
        'respiratory_rate': [respiratory_rate] * n,
        'skin_temp_deviation': [skin_temp_deviation] * n,
        'avg_heart_rate': [avg_heart_rate] * n,
        'max_heart_rate': [max_heart_rate] * n,
        'hr_zone_1_min': [hr_zone_1_min] * n,
        'hr_zone_2_min': [hr_zone_2_min] * n,
        'hr_zone_3_min': [hr_zone_3_min] * n,
        'hr_zone_4_min': [hr_zone_4_min] * n,
        'hr_zone_5_min': [hr_zone_5_min] * n,
        'workout_time_of_day': [workout_time_of_day] * n,
        'calories_burned': calories_burned,
    })

    return df 


def data_preprocessing(df):
    
    df = lag_features(df)
    df = composite_Acute_Cronic_Workload(df)
    df = date_processing(df)
    df = workout_time_of_day_processing(df)
    df = categorical_label_encoding(df)
    
    return df


# Load model globally at server start time 
LIGHTGBM_MODEL = joblib.load(filename=f"{parent_dir}/Injury_risk_prediction/models/LightGBM.pkl")
FEATURE_NAMES = LIGHTGBM_MODEL.feature_names_in_

def predicting(user_email):

    logs = daily_logs(search=True, params={"user_email":user_email, "search_limit":15})
    metrics = health_metrics(search=True, params={"user_email":user_email}) 
    if not logs: raise ValueError("Missing logs, create daily logs for prediction")
    elif not metrics: raise ValueError("Missing health metrics, Create health metrics for prediction")    

    logs_df = pd.DataFrame(logs)
    logs_df = logs_df.sort_values(by='created_at')  # Sort df rows by 'column_A' in ascending order 

    try: 
        df = get_data(metrics, logs_df)
    except Exception as e:
        raise ValueError(f"Error may cus of insufficient data to predict injury risk. Make sure daily log and health metrics profile updated. [ERROR]: {e}.")

    df = data_preprocessing(df)

    latest_df = df.iloc[[-1]]
    
    # Use the globally cached model
    y_pred = LIGHTGBM_MODEL.predict_proba(latest_df[FEATURE_NAMES])   # predict_proba() return the array with probab value of being 0 and 1. Or [p(0)), p(1)]  
    return y_pred[:, 1]  # returning sliced probablity of injury risk (of bieng yes or p(1)) 



if __name__ == "__main__":
    output = predicting(user_email="example@example.com")    
    print("Next day workout injury risk: ", output)





# API endpoint

from api.auth import get_current_user_email
from fastapi import APIRouter, Depends, HTTPException

injury_router= APIRouter()

@injury_router.get("/injury_risk/me")
def injury_risk(email: str = Depends(get_current_user_email)):
    
    try:
        prediction = predicting(email)
        return {"prediction": prediction[0]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
