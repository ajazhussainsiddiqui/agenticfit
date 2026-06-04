import datetime
import os
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from db.crud_db import daily_logs, health_metrics, weekly_exercise_plans


def exercise_profile(user_email):
    profile_data = {}
    
    health = health_metrics(search=True, params={'user_email': user_email})
   
    if health['date_of_birth']:
       profile_data['Age'] = datetime.date.today().year  - health['date_of_birth'].year
    if health['weight_kg']:
        profile_data['Weight'] = health['weight_kg']
    if health['activity_level']:
        profile_data['Activity Level']= health['activity_level']         
    if health['experience_level']:
        profile_data['Experience']= health['experience_level']
    if health['primary_goal']:
        profile_data['Primary Goal']= health['primary_goal']    
    if health['workout_days_per_week']:
        profile_data['Workout Days per Week'] = health['workout_days_per_week']
    if health['workout_duration_min']:
        profile_data['Workout duration (minutes)'] = health['workout_duration_min'] 
    
    logs = daily_logs(search=True, params={'user_email':user_email, 'search_limit':1})            
    if logs:
        latest_log = logs[0]
        if latest_log['injury_status']:
            profile_data['Got injured']= latest_log['injury_note'] if latest_log['injury_note'] else True 

    return profile_data





def strike_week(user_email):

    output = health_metrics(search=True, params={'user_email': user_email})
    days = datetime.date.today() - output['starting_date']
    total_days = days.days

    if (total_days % 7 == 0) and (total_days>=0):
        total_weeks = int(total_days/7) 
    else:
        total_weeks = f"{int(total_days/7)} weeks & {total_days%7} days"    
    return {"total_days": total_days, "strike_week":total_weeks}


def previous_week_plan(user_email):
    
    data = {}

    exercise_db = weekly_exercise_plans(search=True, params={'user_email':user_email, 'search_limit':1})   # latest row of logs             
    if exercise_db:
        latest_exercise = exercise_db[0]
        if latest_exercise['exercises']:
            data['Previous Week plan'] = latest_exercise['exercises']
        if latest_exercise['completed_percentage']:
            data['Workout complete %'] = latest_exercise['completed_percentage']
        if latest_exercise['user_feedback']:
            data['User feedback'] = latest_exercise['user_feedback']            

    return data  


if __name__ == '__main__':
    # response = exercise_profile(user_email='example@example.com')
    # response = strike_week(user_email="tom.hanks@example.com")['strike_week']
    response = previous_week_plan(user_email="example@example.com")
    print(response)