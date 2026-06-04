from typing import List, Literal, Optional, Any
from pydantic import BaseModel, Field



# Shared BASE SCHEMA    

class HealthMetricsBase(BaseModel):
    date_of_birth: Optional[str] = Field(None, description="Format: YYYY-MM-DD")
    gender: Optional[str] = Field(None, description="User's gender")
    height_cm: Optional[float] = Field(None, description="Height (cm)")
    weight_kg: Optional[float] = Field(None, description="Weight (kg)")
    activity_level: Optional[str] = Field(None, description="Sedentary, Lightly Active, Moderate, Very Active")
    primary_goal: Optional[str] = Field(None, description="Losing weight, Muscle Building, Endurance, Wellness")
    experience_level: Optional[str] = Field(None, description="beginner, intermediate, expert")
    workout_days_per_week: Optional[List[str]] = Field(None, description="e.g., ['Monday', 'Wednesday']")
    workout_duration_min: Optional[int] = Field(None, description="Target duration in minutes")
    starting_date: Optional[str] = Field(None, description="Format: YYYY-MM-DD")
    water_reminders: Optional[List[str]] = Field(None, description="Time list: ['08:00:00', '12:30:00']")

class DietaryProfileBase(BaseModel):
    diet_type: Optional[str] = Field(None, description="Standard, Keto, Mediterranean, Vegan, etc.")
    allergies: Optional[List[str]] = Field(None, description="E.g., ['Gluten', 'Nut']")
    preferred_cuisines: Optional[List[str]] = Field(None, description="E.g., ['Indian', 'Italian']")
    daily_calories: Optional[int] = Field(None, description="Daily target (1600-3000)")

class DailyLogBase(BaseModel):
    id: Optional[int] = Field(None, description="Log ID. Omit to target the log for delete.")
    day_strain: Optional[float] = Field(None, ge=0, le=21, description="Physical stress (0-21 scale)")
    recovery_score: Optional[int] = Field(None,ge=0, le=100, description="Readiness percentage (0-100)")
    sleep_hours: Optional[float] = Field(None, description="Hours slept")
    hrv: Optional[int] = Field(None, description="Heart rate variability (ms)")
    total_calories_consumed: Optional[int] = Field(None, description="Calories eaten today")
    workout_completed: Optional[int] = Field(None, description="Workout completion percentage")
    workout_duration_min: Optional[int] = Field(None, description="Minutes exercised today")
    injury_status: Optional[bool] = Field(None, description="True if injured today")
    injury_note: Optional[str] = Field(None, description="Description of the injury")
    calories_burned: Optional[int] = Field(None, description="Calories burned today")






# API SCHEMA 

class Searchworkouts(BaseModel):
    query_text: str 
    method: Literal['vector', 'fts', 'hybrid'] = Field(default='hybrid', description="Database searching method")
    difficulty_filter: Literal['beginner', 'intermediate', 'expert'] = Field(default='beginner', description="Filter type according to your experiance")
    page_limit:int = Field(default=10, ge=1, le=20, description="The number of workouts will fetch")    

class BYOKRequest(BaseModel):
    provider: str = None 
    model_name: str  
    api_key: Optional[str] = None
    base_url: Optional[str] = None

class ExercisePlanPayload(BaseModel):
    id : Optional[int] = None 
    exercises: Any 
    completed_percentage: Optional[int] = None
    user_feedback: Optional[str] = None

class DietPlanPayload(BaseModel):
    id : Optional[int] = None 
    diet_plan: Any 
    user_feedback: Optional[str] = None




# ASSISTANT TOOLS SCHEMA

class UsersNameInputs(BaseModel):
    action: Literal['search', 'update'] = Field( ..., description="Database operation.")        
    user_name: str = Field(None, description="User's new name.")


class HealthMetricsInput(HealthMetricsBase):   # inherit from above define base 
    action: Literal['search', 'update'] = Field( ..., description="Database operation.")


class DietaryProfileInput(DietaryProfileBase):
    action: Literal['search', 'update'] = Field(..., description="Database operation.")
    
class DailyLogInput(DailyLogBase):
    action: Literal['insert', 'search', 'update', 'delete'] = Field(..., description="Database operation.")
    search_limit: Optional[int] = Field(default=1, le=5, description="Number of last log entry search")

class FetchPlansInput(BaseModel):
    plan_type: Literal['diet', 'exercise'] = Field(..., description="Which plan to fetch.")

