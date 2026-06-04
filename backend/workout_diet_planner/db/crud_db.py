import os
from contextlib import contextmanager

import psycopg2
from dotenv import load_dotenv
from psycopg2 import pool
from psycopg2.extras import Json, RealDictCursor

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# def get_db_connection():
#     return psycopg2.connect(DATABASE_URL)

try:
    db_pool = psycopg2.pool.ThreadedConnectionPool(1, 10, dsn=DATABASE_URL)
except psycopg2.DatabaseError as e:
    print(f"Error creating connection pool: {e}")
    db_pool = None


@contextmanager
def get_db_connection():
    if not db_pool:
        raise Exception("Database connection pool is not initialized.")
    
    conn = db_pool.getconn()
    try:
        yield conn
    finally:
        db_pool.putconn(conn)   





def users(insert=None, search=None, update=None, delete=None, params=None):

    email = params.get('user_email')
    name = params.get('name')   
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                
                if insert:
                    sql = """INSERT INTO users (email, name) VALUES (%s, %s) RETURNING id;"""
                    cur.execute(sql, (email, name))
                    conn.commit()         
                    return cur.fetchone()  
                
                if search:
                    sql = """SELECT * FROM users WHERE email = %s;"""   
                    cur.execute(sql, (email,))
                    return cur.fetchone()  

                if update:
                    sql = """UPDATE users SET name = %s, updated_at = NOW() WHERE email = %s RETURNING id;"""
                    cur.execute(sql, (name, email))
                    conn.commit()              
                    return cur.fetchone()
                
                if delete:
                    sql = """DELETE FROM users WHERE email = %s RETURNING id;"""
                    cur.execute(sql, (email,))
                    conn.commit()            
                    return cur.fetchone()
    except psycopg2.Error as e: 
        return {"error": str(e), "operation": "users"}  


def health_metrics(insert=None, search=None, update=None, delete=None, params=None):
   
    user_email = params.get('user_email')
    date_of_birth = params.get('date_of_birth')
    gender = params.get('gender')
    height_cm = params.get('height_cm')
    weight_kg = params.get('weight_kg')
    activity_level = params.get('activity_level')  # [Sedentary: Little to no exercise, Lightly Active, Active/Moderately Active, Very Active]
    primary_goal = params.get('primary_goal')      # [Losing weight,  gaining weight, Muscle Building, Endurance & Stamina, Holistic Wellness]
    experience_level = params.get('experience_level')  # beginner, intermediate, advanced
    workout_days_per_week = params.get('workout_days_per_week')
    workout_duration_min = params.get('workout_duration_min')
    starting_date =  params.get('starting_date') 
    water_reminders = params.get('water_reminders')  
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:

                if insert:
                    sql = """INSERT INTO health_metrics (user_email, date_of_birth, gender, height_cm, weight_kg, activity_level, primary_goal, 
                            experience_level, workout_duration_min, workout_days_per_week, starting_date, water_reminders) 
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::time[]) RETURNING id;"""
                    
                    cur.execute(sql, (user_email, date_of_birth, gender, height_cm, weight_kg, activity_level, primary_goal, experience_level, workout_duration_min, workout_days_per_week, starting_date, water_reminders))
                    conn.commit()
                    return cur.fetchone()  
                
                if search:
                    sql = "SELECT * FROM health_metrics WHERE user_email = %s;"
                    cur.execute(sql, (user_email,))
                    return cur.fetchone() 
            
                if update:
                    sql = """UPDATE health_metrics SET date_of_birth = %s, gender = %s, height_cm = %s, weight_kg = %s, activity_level = %s, 
                    primary_goal = %s, experience_level=%s, workout_days_per_week=%s, workout_duration_min=%s, starting_date=%s, 
                    water_reminders=%s::time[], updated_at = NOW() WHERE user_email = %s RETURNING id;""" 
                    cur.execute(sql, (date_of_birth, gender, height_cm, weight_kg, activity_level, primary_goal, experience_level, workout_days_per_week, workout_duration_min, starting_date, water_reminders, user_email))
                    conn.commit()
                    return cur.fetchone()   
                
                if delete:
                    sql = "DELETE FROM health_metrics WHERE user_email = %s RETURNING id;"
                    cur.execute(sql, (user_email,))
                    conn.commit()
                    return cur.fetchone()  
    except psycopg2.Error as e: 
        return {"error": str(e), "operation": "health_metrics"}   


def dietary_profiles(insert=None, search=None, update=None, delete=None, params=None):

    user_email = params.get('user_email')
    diet_type = params.get('diet_type')      # [Standard, Keto, Mediterranean, Vegetarian, Vegan, ]
    allergies = params.get('allergies')      # [Gluten, Lactose, Nut]
    preferred_cuisines = params.get('preferred_cuisines')  # ['Indian', 'Mediterranean']
    daily_calories = params.get('daily_calories')   # daily maintenance range of 1,600 to 3,000
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:

                if insert:
                    sql = "INSERT INTO dietary_profiles (user_email, diet_type, allergies, preferred_cuisines, daily_calories) VALUES (%s, %s, %s, %s, %s) RETURNING id;"   
                    cur.execute(sql, (user_email, diet_type, allergies, preferred_cuisines, daily_calories))
                    conn.commit()
                    return cur.fetchone()  
                
                if search:
                    sql = "SELECT * FROM dietary_profiles WHERE user_email = %s;"
                    cur.execute(sql, (user_email,))
                    return cur.fetchone() 
            
                if update:
                    sql = """UPDATE dietary_profiles SET diet_type = %s, allergies = %s, preferred_cuisines = %s, 
                    daily_calories = %s, updated_at = NOW() WHERE user_email = %s RETURNING id;""" 
                    cur.execute(sql, (diet_type, allergies, preferred_cuisines, daily_calories, user_email))
                    conn.commit()
                    return cur.fetchone()  # Return the id of the updated dietary_profiles record
                
                if delete:
                    sql = "DELETE FROM dietary_profiles WHERE user_email = %s RETURNING id;"
                    cur.execute(sql, (user_email,))
                    conn.commit()
                    return cur.fetchone()  
    except psycopg2.Error as e: 
        return {"error": str(e), "operation": "dietary_profiles"}   
      

def daily_logs(insert=None, search=None, update=None, delete=None, params=None):
    id = params.get('id')
    user_email = params.get('user_email')
    day_strain = params.get('day_strain')  # [Light(0–9), Moderate(10–13), High(14–17), All Out(18–21)]   everything that makes your heart work harder, including exercise, work stress, chores.
    recovery_score = params.get('recovery_score')    # 0-100%    daily "readiness" rating that tells a user how prepared their body is to handle physical stress (Strain)
    sleep_hours = params.get('sleep_hours')    
    hrv = params.get('hrv')        # Heart rate variability (milliseconds)- variation in time between consecutive heartbeats (higher is better cuz it rapidly adjust to different demands, like shifting from a calm state to a sudden need for action) 
    total_calories_consumed = params.get('total_calories_consumed')
    workout_completed = params.get('workout_completed')
    workout_duration_min = params.get('workout_duration_min')
    injury_status = params.get('injury_status')
    injury_note = params.get('injury_note')
    calories_burned = params.get('calories_burned')
    search_limit = params.get('search_limit')
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:

                if insert:
                    sql = """INSERT INTO daily_logs (user_email, day_strain, recovery_score, sleep_hours, hrv, total_calories_consumed, workout_completed,
                        workout_duration_min, injury_status, injury_note, calories_burned) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) RETURNING id;"""
                    cur.execute(sql, (user_email, day_strain, recovery_score, sleep_hours, hrv,total_calories_consumed, workout_completed, workout_duration_min, injury_status, injury_note, calories_burned))
                    conn.commit()
                    return cur.fetchone()
                
                if search:
                    sql = "SELECT * FROM daily_logs WHERE user_email=%s ORDER BY created_at DESC LIMIT %s;"
                    cur.execute(sql, (user_email, search_limit))
                    return cur.fetchall()
                
                if update:
                    sql = """UPDATE daily_logs SET day_strain=%s, recovery_score=%s, sleep_hours=%s, hrv=%s, total_calories_consumed=%s, 
                    workout_completed=%s, workout_duration_min=%s, injury_status=%s, injury_note=%s, calories_burned=%s WHERE user_email=%s AND id=%s RETURNING id;    
                    """
                    cur.execute(sql, (day_strain, recovery_score, sleep_hours, hrv,total_calories_consumed, workout_completed, workout_duration_min, injury_status, injury_note, calories_burned, user_email, id))
                    conn.commit() 
                    return cur.fetchone()
                
                if delete:
                    cur.execute( "DELETE FROM daily_logs WHERE user_email=%s AND id=%s RETURNING id;", (user_email, id))
                    conn.commit()
                    return cur.fetchone()
    except psycopg2.Error as e: 
        return {"error": str(e), "operation": "daily_logs"}   
   

def weekly_exercise_plans(insert=None, search=None, update=None, delete=None, params=None):
    id = params.get('id')
    user_email = params.get('user_email')
    exercises = params.get('exercises')
    completed_percentage = params.get('completed_percentage')
    user_feedback = params.get('user_feedback')
    search_limit = params.get('search_limit') 
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
            
                if insert:  
                    sql = "INSERT INTO weekly_exercise_plans (user_email, exercises, completed_percentage, user_feedback) VALUES (%s, %s, %s, %s) RETURNING id;"
                    cur.execute(sql, (user_email, Json(exercises), completed_percentage, user_feedback))
                    conn.commit()
                    return cur.fetchone()

                if search:
                    sql="SELECT * FROM weekly_exercise_plans WHERE user_email=%s ORDER BY created_at DESC LIMIT %s;"
                    cur.execute(sql, (user_email, search_limit))
                    return cur.fetchall()

                if update:
                    sql = "UPDATE weekly_exercise_plans SET exercises=%s, completed_percentage=%s, user_feedback=%s WHERE user_email=%s AND id=%s RETURNING id;"
                    cur.execute(sql, (Json(exercises), completed_percentage, user_feedback, user_email, id))
                    conn.commit()
                    return cur.fetchone()

                if delete:
                    sql = "DELETE FROM weekly_exercise_plans WHERE user_email=%s AND id=%s RETURNING id;"
                    cur.execute(sql, (user_email, id))
                    conn.commit()
                    return cur.fetchone()        
    except psycopg2.Error as e: 
        return {"error": str(e), "operation": "weekly_exercise_plans"}   


def weekly_meal_plans(insert=None, search=None, update=None, delete=None, params=None):
    id = params.get('id')
    user_email = params.get('user_email')
    diet_plan = params.get('diet_plan')
    user_feedback = params.get('user_feedback')
    search_limit = params.get('search_limit')
    try:
        with get_db_connection() as conn:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:

                if insert:
                    sql = "INSERT INTO weekly_meal_plans (user_email, diet_plan, user_feedback) VALUES (%s, %s, %s) RETURNING id;"
                    cur.execute(sql, (user_email, Json(diet_plan), user_feedback))
                    conn.commit()
                    return cur.fetchone()
                
                if search:
                    sql = "SELECT * FROM weekly_meal_plans WHERE user_email=%s ORDER BY created_at DESC LIMIT %s;"
                    cur.execute(sql, (user_email, search_limit))
                    return cur.fetchall()
                
                if update:
                    sql = "UPDATE weekly_meal_plans SET diet_plan=%s, user_feedback=%s WHERE user_email=%s AND id=%s RETURNING id;"
                    cur.execute(sql, (Json(diet_plan), user_feedback, user_email, id))
                    conn.commit()
                    return cur.fetchone()
                
                if delete:
                    cur.execute("DELETE FROM weekly_meal_plans WHERE user_email=%s AND id=%s RETURNING id;", (user_email, id))
                    conn.commit()
                    return cur.fetchone()
    except psycopg2.Error as e: 
        return {"error": str(e), "operation": "weekly_meal_plans"}   



if __name__ == "__main__":

    # output = users(insert=True, params={'user_email': "tom.hanks@example.com", 'name': "Tom Hanks"}) 
    
    # output = weekly_meal_plans(search=True, params={
    #     'id': 3, 
    #     'user_email':'example@example.com',
    #     'diet_plan': "N/A",
    #     'search_limit':1
    #     })

    # output = weekly_exercise_plans(search=True, params={'user_email':'example@example.com', 'completed_percentage': 90, 'search_limit':1, 
    #                                              'exercises':{
    #                                                  ### **Monday: Full Body Stability & Upper Focus**
    #         "Warm-up": '5 minutes of Arm Circles and Hip Swings (Full Body Mobility)',
    #         "Seated Band Rows": '3 sets of 12 repetitions (Focus on back and biceps)',
    #         "Wall Push-ups": '3 sets of 10–12 repetitions (Focus on chest and shoulders)',
    #         "Seated Knee Extensions": '3 sets of 10 repetitions (Focus on right leg control)',
    #         "Bird-Dog": '3 sets of 8 repetitions per side (Focus on core and contralateral stability)',
    #         "Calf Raises (Supported)": '3 sets of 15 repetitions (Focus on calves, using support)'
    #                                              }})

    # output = daily_logs(search=True, params={
    #     'user_email': "example@example.com",
    #     'day_strain': 19,
    #     'recovery_score': 50, 
    #     'sleep_hours': 6,
    #     'hrv': 80,
    #     'total_calories_consumed': 300,
    #     'workout_completed':95,
    #     'workout_duration_min':30,
    #     'injury_status':True,
    #     'injury_note': "my left leg mild injured",
    #     "calories_burned": 3000, 
    #     "search_limit":1,
    # })
    
    output = health_metrics(insert=True, 
                    params={
                    'user_email': "tom.hanks@example.com",
                    'date_of_birth': "1956-07-09",
                    'gender': "Male",
                    'height_cm': 178,
                    'weight_kg': 77,
                    'activity_level': "Moderate",
                    'primary_goal': "Weight Loss",
                    'experience_level': 'beginner',
                    'workout_days_per_week': ["Monday", "Tuesday", "Friday", "Sunday"],
                    'workout_duration_min': 30,
                    'starting_date': '2025-01-24',
                    'water_reminders': ['08:00:00', '12:30:00', '18:00:00', '21:15:00'] 
                })
    
    # output = dietary_profiles(search=True, 
    #                           params={
    #                             'user_email':'example@example.com',
    #                             'diet_type': "Vegan",
    #                             'allergies': ['peanuts', 'shellfish'],
    #                             'preferred_cuisines': ['Indian', 'Mediterranean'],
    #                             'daily_calories': 2000
    #                           })


    print(output)