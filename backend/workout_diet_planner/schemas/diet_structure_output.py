from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class MealType(str, Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"
    SNACK = "snack"


class FoodItem(BaseModel):
    name: str = Field(description="Name of the food item or ingredient")
    portion_size: str = Field(description="e.g., '150g', '1 cup', '2 slices'")


class Meal(BaseModel):
    meal_type: MealType
    food_items: List[FoodItem]
    calories: int = Field(default=None, description="calories for this meal")
    protein: int = Field(default=None, description="protein for this meal")
    carbs: int = Field(default=None, description="carbs for this meal")
    fat: int = Field(default=None, description="fat for this meal")
    prep_time_min: Optional[int] = None


class DietDay(BaseModel):
    meals: List[Meal]
    notes: Optional[str] = None 


class WeeklyDietPlan(BaseModel):
    Monday: DietDay = Field(description="Monday meal schedule")
    Tuesday: DietDay = Field(description="Tuesday meal schedule")
    Wednesday: DietDay = Field(description="Wednesday meal schedule")
    Thursday: DietDay = Field(description="Thursday meal schedule")
    Friday: DietDay = Field(description="Friday meal schedule")
    Saturday: DietDay = Field(description="Saturday meal schedule")
    Sunday: DietDay = Field(description="Sunday meal schedule")