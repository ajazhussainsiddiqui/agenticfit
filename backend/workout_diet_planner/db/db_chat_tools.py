from datetime import datetime

from langchain_core.runnables import RunnableConfig
from langchain_core.tools import tool

from schemas.schemas import (UsersNameInputs, HealthMetricsInput, DietaryProfileInput, DailyLogInput, FetchPlansInput)
from db.crud_db import (daily_logs, dietary_profiles, health_metrics, users, weekly_exercise_plans, weekly_meal_plans)
from injury_model_api_inference import predicting



#  USERS METRICS TOOL
@tool(args_schema=UsersNameInputs)
def manage_user_name(action:str, user_name:str, config:RunnableConfig):
    """Manage user's name.
    - action: 'search', 'update'.
    - For 'update', need updated user_name.
    """
    user_email = config.get('configurable', {}).get('user_email')
    if not user_email:
        return "Action denied: The user is not logged in."

    params = {'user_email':user_email, 'name':user_name}
    if action=='insert':
        return users(insert=True, params=params)
    if action== 'search':
        return users(search=True, params=params)
    if action== 'update':
        return users(update=True, params=params)
    if action=='delete':
        return users(delete=True, params=params)
     

#  HEALTH METRICS TOOL
@tool(args_schema=HealthMetricsInput)
def manage_health_metrics(action: str, config: RunnableConfig, **kwargs):
    """Manage a user's health metrics and physical profile.
    - action: 'search', 'update'.
    - For 'update', ONLY provide the fields you want to change. Omitted fields remain unchanged.
    """
    user_email = config.get('configurable', {}).get('user_email')
    if not user_email:
        return "Action denied: The user is not logged in."
        
    params = {"user_email": user_email, **kwargs}
    if action == 'insert': 
        return health_metrics(insert=True, params=params)
    if action == 'search': 
        return health_metrics(search=True, params=params)
    if action == 'delete': 
        return health_metrics(delete=True, params=params)
    if action == 'update': 
        existing_record = health_metrics(search=True, params={'user_email': user_email})
        for key, value in kwargs.items():
            if value is not None:
                existing_record[key]=value        # overwite new updated value         
        return health_metrics(update=True, params=existing_record)   
    



# DIETARY PROFILE TOOL
@tool(args_schema=DietaryProfileInput)
def manage_dietary_profile(action: str, config:RunnableConfig, **kwargs):
    """Manage a user's dietary preferences, allergies, and calorie targets.
    - action: 'search', 'update'.
    - For 'update', ONLY provide the fields you want to change. Omitted fields remain unchanged.
    """
    user_email = config.get('configurable', {}).get('user_email')
    if not user_email:
        return "Action denied: The user is not logged in."
        
    params = {"user_email": user_email, **kwargs}
    if action == 'insert': 
        return dietary_profiles(insert=True, params=params)
    if action == 'search': 
        return dietary_profiles(search=True, params=params)
    if action == 'delete': 
        return dietary_profiles(delete=True, params=params)
    if action == 'update': 
        existing_record = dietary_profiles(search=True, params={'user_email': user_email})
        for key, value in kwargs.items():
            if value is not None:
                existing_record[key]=value        # overwite with updated value         
        return dietary_profiles(update=True, params=existing_record)   



# DAILY LOGS TOOL
@tool(args_schema=DailyLogInput)
def manage_daily_logs(action: str, config:RunnableConfig, **kwargs):
    """Log or manage daily habits, sleep, recovery, strain, calories, and injuries.
    - action: 'insert', 'search', 'update', or 'delete'.
    - If 'id' is omitted during an update/delete, the system automatically targets the most recent log.
    - For 'update', ONLY provide the fields you want to change.
    """
    user_email = config.get('configurable', {}).get('user_email')
    if not user_email:
        return "Action denied: The user is not logged in."
        
    params = {"user_email": user_email, **kwargs}
    if action == 'insert': 
        return daily_logs(insert=True, params=params)
    if action == 'search': 
        return daily_logs(search=True, params=params)
    if action in ['update', 'delete']:
        if kwargs.get('id') is None:
            existing_logs = daily_logs(search=True, params=params)
            latest_log_id = existing_logs[0]['id']
            params['id'] = latest_log_id   

        if action == 'update':
            records = daily_logs(search=True, params=params)
            if not records:
                return "No log found to update."
            latest_log = records[0]
            for key, value in kwargs.items():
                if value is not None:
                    latest_log[key]=value
            params.update(latest_log)                 

    if action == 'update': 
        return daily_logs(update=True, params=params)
    if action == 'delete': 
        return daily_logs(delete=True, params=params)




#  FETCH EXISTING PLANS TOOL     
@tool(args_schema=FetchPlansInput)
def fetch_current_plans(config:RunnableConfig, plan_type: str):
    """Fetch the user's currently active weekly diet or exercise plans."""
    user_email = config.get('configurable', {}).get('user_email')
    if not user_email:
        return "Action denied: The user is not logged in."
        
    params = {"user_email": user_email, "search_limit":1}   # only fetch latest created plan
    
    if plan_type == 'diet':
        records = weekly_meal_plans(search=True, params=params)
        return records[0] if records else "No diet plan found."
    elif plan_type == 'exercise':
        records = weekly_exercise_plans(search=True, params=params)
        return records[0] if records else "No exercise plan found."
    else:
        return "Invalid plan_type. Must be 'diet' or 'exercise'."


# Injury risk prediction tool using ML model (LightGBM) and data from DB 
@tool
def predict_injury_risk(config:RunnableConfig):
    """Predict the next day exercise injury risk, based on user's recent daily logs using ML model."""
    user_email = config.get('configurable', {}).get('user_email')
    if not user_email:
        return "Action denied: The user is not logged in."
        
    try:
        prediction = predicting(user_email)
        return {"injury_risk_%": int(prediction[0]*100)}
    except Exception as e:
        return {"error": str(e)}
    
    
# current date time day of week info
@tool
def get_current_time():
    """Get the real-time current date, time, and day of the week."""
    now = datetime.now()
    return {"current_date": now.strftime("%Y-%m-%d"), 
            "current_time": now.strftime("%H:%M:%S"),
            "day_of_week": now.strftime("%A"), 
            "timezone": str(now.astimezone().tzinfo)}


db_tools_list = [manage_health_metrics, manage_dietary_profile, manage_daily_logs, fetch_current_plans, manage_user_name, predict_injury_risk, get_current_time]


