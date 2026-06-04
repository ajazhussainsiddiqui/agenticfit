from crewai import Agent, Crew, Task
import os, sys

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from config.config import get_crew_model, get_langchain_model
from db.crud_db import weekly_meal_plans
from schemas.diet_structure_output import WeeklyDietPlan
from services.nutrition_profile import diet_profile, previous_diet_plan


def run_diet_crew(user_email, inputs):

    MODEL_CREW = get_crew_model(user_email)

    # AGENTS
    
    nutrition_summarizer = Agent(
        role="Nutrition Profile Summarizer",
        goal="Extract and condense user dietary preferences, restrictions, and macro targets into clear, actionable bullet points.",
        backstory="You are a registered dietitian expert in translating health data and user preferences into precise nutritional targets.",
        llm=MODEL_CREW
    )

    weekly_dietitian = Agent(
        role="Dietitian & Meal Planner",
        goal="Generate a fully structured, macro-accurate 7-day meal schedule based on the user's nutritional profile.",
        backstory="You are a meal planning expert with access to extensive nutritional databases. You specialize in building sustainable weekly schedules that hit specific calorie goals without compromising on dietary restrictions.",
        llm=MODEL_CREW
    )



    # TASKS

    summarize_nutrition_profile = Task(
        description="""All required user's nutrition & health profile 
        {diet_profile}
        Previous week's diet plan & compliance: \n{previous_diet_plan}
        Summarize the profile while explicitly noting dietary restrictions, calorie targets, and recent compliance history.""",
        expected_output="A bullet-point summary containing only essential metrics needed for meal generation.",
        agent=nutrition_summarizer
    )


    generate_weekly_schedule = Task(
        description="""Using the profile summary, create a full 7-day meal schedule (Monday through Sunday). 
        Research appropriate meals that match the targets and organize them directly into daily assignments (Breakfast, Lunch, Dinner, Snacks).
        Ensure all meals respect user preference, include exact macros (calories, protein, carbs, fat), and provide prep notes. Do not invent new dietary restrictions.""",
        expected_output="A day-by-day 7-day schedule with exact meal breakdowns, ready for structured output.",
        agent=weekly_dietitian,
        context=[summarize_nutrition_profile]
    )


    crew = Crew(
        agents=[nutrition_summarizer, weekly_dietitian],
        tasks=[summarize_nutrition_profile, generate_weekly_schedule],
        verbose=True
    )
    
    return crew.kickoff(inputs=inputs)



def structured_diet_output(user_email):
    inputs = {
        "diet_profile": diet_profile(user_email),
        "previous_diet_plan": previous_diet_plan(user_email)
    }
    result = run_diet_crew(user_email=user_email, inputs=inputs)
    
    MODEL_LANGCHAIN = get_langchain_model(user_email)
    structured_model = MODEL_LANGCHAIN.with_structured_output(schema=WeeklyDietPlan) 
    
    response = structured_model.invoke(result.raw)
    return response


def diet_generate_save_into_db(user_email):
    print('Generating meal plan...')
    generated_meal = structured_diet_output(user_email)

    print("Saving into DB's meal table...") 
    response = weekly_meal_plans(insert=True, params={'user_email':user_email, 'diet_plan':generated_meal.model_dump()})
    return response


if __name__ == '__main__':
    output = diet_generate_save_into_db(user_email="example@example.com")
    print(output) 
    