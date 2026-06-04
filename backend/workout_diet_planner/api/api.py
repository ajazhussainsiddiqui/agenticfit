from typing import Literal
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
import json 
import uuid

from agents.diet_agents import diet_generate_save_into_db
from api.auth import get_current_user_email
from config.config import set_user_llm_config, redis_client
from db.crud_db import (daily_logs, dietary_profiles, health_metrics, users, weekly_exercise_plans, weekly_meal_plans)
from db.exercises_rag_retriever import get_workouts
from agents.workout_rag_agents import exercise_generate_save_into_db
from schemas.schemas import (Searchworkouts, BYOKRequest, HealthMetricsBase, DietaryProfileBase, DailyLogBase, ExercisePlanPayload, DietPlanPayload)  

router = APIRouter()




# search in the all available workouts documents 

@router.post("/search-workouts")
def search_workouts(params: Searchworkouts):
    
    response = get_workouts(query_text=params.query_text, difficulty=params.difficulty_filter, method=params.method, limit=params.page_limit)
    return response



# receive user enter models info with key 
@router.post("/set-llm-keys")
def set_llm_keys(req: BYOKRequest, email: str = Depends(get_current_user_email)):
    set_user_llm_config(user_email=email, provider=req.provider, model_name=req.model_name, api_key=req.api_key, base_url=req.base_url)
    return {"user_email": email, "provider":req.provider, "model_name": req.model_name, "base_url":req.base_url}


# get info about model stored in redis cached
@router.get("/get-byok-details")
def get_llm_keys(email : str = None):
    cached_llm = redis_client.get(f"byok_{email}")
    if not cached_llm:
        raise HTTPException(status_code=404, detail="LLM Config Not Found")
    llm_data = json.loads(cached_llm)
    return {"email":email, "provider":llm_data.get("provider"), "model_name":llm_data.get("model_name")} 
    

#  User Routes 

@router.get("/users/search")   # search for users if not existing (i.e. new user) then create profile, health_metrics, dietary_profile
def get_user(email: str = Depends(get_current_user_email)):
    result = users(search=True, params={"user_email": email})
    if email is None:
        raise HTTPException(status_code=404, detail="Guest user you need to login first") 
    if not result:
        print(f"New user detected! Auto-creating profiles (users, health_metrics, dietary_profiles) for '{email}'")
        users(insert=True, params={"user_email": email, "name": email.split("@")[0]})  # create users
        health_metrics(insert=True, params={"user_email":email})                       # create health metrics 
        dietary_profiles(insert=True, params={"user_email":email})                     # create dietary profiles

        result = users(search=True, params={"user_email": email})
    return result


@router.post("/users/update")
def update_user(updated_name: str, email: str = Depends(get_current_user_email)):
    result = users(update=True, params={"user_email": email, 'name':updated_name})
    if not result:
        raise HTTPException(status_code=404, detail="User not found")
    return result



#  Health Metrics Routes 

@router.get("/health-metrics/search")
def get_health_metrics(email: str = Depends(get_current_user_email)):
    result = health_metrics(search=True, params={"user_email": email})
    if not result:
        raise HTTPException(404, "Not found")
    return result


@router.patch("/health-metrics/update")
def update_health_metrics(payload: HealthMetricsBase, email: str = Depends(get_current_user_email)):
    existing = health_metrics(search=True, params={"user_email": email})
    if not existing:
        raise HTTPException(status_code=404, detail="Not found")
    
    update_data = existing.copy()
    for key, val in payload.model_dump(exclude_unset=True).items():
        if val is not None:
            update_data[key] = val
    
    result = health_metrics(update=True, params=update_data)
    return result


# Dietary Profile Routes

@router.get("/dietary-profiles/search")
def get_dietary_profile(email: str = Depends(get_current_user_email)):
    result = dietary_profiles(search=True, params={"user_email": email})
    if not result:
        raise HTTPException(404, "Not found")
    return result


@router.patch("/dietary-profiles/update")
def update_dietary_profile(payload: DietaryProfileBase, email: str = Depends(get_current_user_email)):
    existing = dietary_profiles(search=True, params={"user_email": email})
    if not existing:
        raise HTTPException(status_code=404, detail="Not found")
    
    update_data = existing.copy()
    for key, val in payload.model_dump(exclude_unset=True).items():
        if val is not None:
            update_data[key] = val
    
    result = dietary_profiles(update=True, params=update_data)
    return result


#  Daily Logs Routes

@router.post("/daily-logs/create")
def create_daily_log(payload: DailyLogBase, email: str = Depends(get_current_user_email)):
    payload_dict = payload.model_dump()
    payload_dict['user_email'] = email

    result = daily_logs(insert=True, params=payload_dict)
    if email is None:
        raise HTTPException(status_code=404, detail="Guest user, you need to login first")    
    return result


@router.get("/daily-logs/search")
def get_daily_logs(email: str = Depends(get_current_user_email), search_limit:int = None):
    return daily_logs(search=True, params={"user_email": email, "search_limit":search_limit}) or []


@router.patch("/daily-logs/update")
def update_log(payload: DailyLogBase, email: str = Depends(get_current_user_email)):
    
    params = {"user_email":email, **payload.model_dump()}    
    result = daily_logs(update=True, params=params)
    return result


@router.delete("/daily-logs/delete")
def delete_daily_logs(log_id:int, email: str = Depends(get_current_user_email)):
    return daily_logs(delete=True, params={"user_email": email, "id":log_id}) or []




# GENERATE PLAN

@router.post("/plans/generate/{plan_type}")
def generate_weekly_plan(plan_type:Literal['exercise', 'diet'],background_tasks : BackgroundTasks, email: str = Depends(get_current_user_email)):
   
    job_id = str(uuid.uuid4())
    set_plan_job_status(email, plan_type, 'processing', job_id)
   
    background_tasks.add_task(run_job, email, plan_type, job_id)  # Pass job_id too the task so it can update status on completion/failure
    return {"plan_type": plan_type, "job_id": job_id, "status": "processing"}
 
 
@router.get("/plans/status/{job_id}")
def get_generating_status(job_id: str):
    status = get_plan_generating_status(job_id)
    if not status:
        raise HTTPException(404, "Not found or expired")
    return status

# helper fn 
def set_plan_job_status(user_email: str, plan_type: str, status: str, job_id: str):
    redis_client.setex(f"gen_plan:{job_id}", 3600, json.dumps({"email": user_email, "type": plan_type, "status": status}))

def get_plan_generating_status(job_id: str):
    data = redis_client.get(f"gen_plan:{job_id}")
    return json.loads(data) if data else None

def run_job(email: str, plan_type:str, job_id: str):
    try:
        if plan_type=='exercise':
           exercise_generate_save_into_db(user_email=email)
        elif plan_type=='diet':
            diet_generate_save_into_db(user_email=email)
        set_plan_job_status(email, plan_type, "completed", job_id)
    except Exception as e:
        set_plan_job_status(email, plan_type, f"failed: {str(e)}", job_id)



# Plan Storage & Retrieval

@router.get("/plans/exercise/history")
def get_exercise_plan_history(email: str = Depends(get_current_user_email), search_limit:int=None):
    return weekly_exercise_plans(search=True, params={"user_email": email, "search_limit":search_limit}) or []

@router.get("/plans/diet/history")
def get_diet_plan_history(email: str = Depends(get_current_user_email), search_limit : int = None):
    return weekly_meal_plans(search=True, params={"user_email": email, "search_limit":search_limit}) or []


@router.patch("/plans/exercise/update")
def update_exercise(payload: ExercisePlanPayload, email: str = Depends(get_current_user_email)):

    params = {"user_email":email, **payload.model_dump()}    
    result = weekly_exercise_plans(update=True, params=params)
    return result


@router.patch("/plans/diet/update")
def update_diet(payload: DietPlanPayload, email: str = Depends(get_current_user_email)):

    params = {"user_email":email, **payload.model_dump()}    
    result = weekly_meal_plans(update=True, params=params)
    return result


@router.delete("/plan/diet/delete")
def delete_diet(diet_id:int, email:str = Depends(get_current_user_email)):
    return weekly_meal_plans(delete=True, params={'user_email':email, 'id':diet_id})

@router.delete("/plan/exercise/delete")
def delete_exercise(exercise_id:int, email:str = Depends(get_current_user_email)):
    return weekly_exercise_plans(delete=True, params={'user_email':email, 'id':exercise_id})