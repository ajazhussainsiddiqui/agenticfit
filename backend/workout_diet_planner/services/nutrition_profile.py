import os
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from db.crud_db import dietary_profiles, health_metrics, weekly_meal_plans


def diet_profile(user_email):
    profile_data = {}

    health = health_metrics(search=True, params={'user_email': user_email})
    if health.get('primary_goal'):
        profile_data['Dietary Goal'] = health['primary_goal']  # e.g., fat loss, muscle gain, maintenance
    if health.get('weight_kg'):
        profile_data['Weight (kg)'] = health['weight_kg']
    if health.get('activity_level'):
        profile_data['Activity Level'] = health['activity_level']
    
    dietary = dietary_profiles(search=True, params={'user_email': user_email})
    if dietary.get('daily_calories'):
        profile_data['Daily Calorie Target'] = dietary['daily_calories']
    if dietary.get('allergies'):
        profile_data['Allergies/Restrictions'] = dietary['allergies']
    if dietary.get('diet_type'):
        profile_data['Preference'] = dietary['diet_type']    
    if dietary.get('preferred_cuisines'):
        profile_data['Cuisines Preference'] = dietary['preferred_cuisines']     

    return profile_data


 
def previous_diet_plan(user_email):
    data = {}

    latest_diet = weekly_meal_plans(search=True, params={'user_email': user_email, 'search_limit':1})
    
    if latest_diet:
        latest_diet = latest_diet[0]
        if latest_diet.get('diet_plan'):
            data['Previous Week Plan'] = latest_diet['diet_plan']
        if latest_diet.get('user_feedback'):
            data['User Feedback'] = latest_diet['user_feedback']

    return data




if __name__ == "__main__":
    # output = health_metrics(search=True, params={"user_email":user_email})
    # output = dietary_profiles(search=True, params={'user_email':user_email})
    # output = diet_profile()
    output = previous_diet_plan("example@example.com")
    print(output)