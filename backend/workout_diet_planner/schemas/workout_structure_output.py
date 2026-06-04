from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, create_model


class Difficulty(str, Enum):
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class Exercise(BaseModel):
    name: str = Field(description="Exercise name")
    sets: int = Field(ge=1, le=10)
    reps: int = Field(ge=1, le=50)
    targeted_muscles: List[str] = Field(default_factory=list)
    difficulty: Difficulty


class WorkoutDay(BaseModel):
    focus: str     # e.g., "Upper Body", "Cardio"
    exercises: List[Exercise]
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None


# creating dynamic model 
def create_weekly_plan_model(selected_days:List[str])  -> type[BaseModel]:
    fields = {}
    
    for day in selected_days:
        fields[day] = (WorkoutDay, Field(description=f"Workout schedule for {day}"))

    return create_model("weeklyPlan", __base__=BaseModel, **fields) 



