from typing import List, Optional

from pydantic import BaseModel, Field
from typing_extensions import TypedDict


class FoodConfirmation(BaseModel):
    is_food: bool = Field(description="True if the image clearly contains edible food or a meal, False otherwise.")
    reason: str = Field(description="Brief reason for this classification.")


class IngredientCalorie(BaseModel):
    name: str = Field(description="Name of the ingredient")
    calories: int = Field(description="Estimated calories for this ingredient")

class FoodCalorieInfo(BaseModel):
    food_name: str = Field(description="The primary name of the dish or food item.")
    total_calories: int = Field(description="Total estimated calories for the entire dish.")
    breakdown: List[IngredientCalorie] = Field(default_factory=list, description="A breakdown of calories by visible ingredients.")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0 of this estimation.")


class States(TypedDict):
    user_email: str 
    base64_image: str     
    is_food: bool 
    status_message:str             
    calorie_info: Optional[FoodCalorieInfo]   