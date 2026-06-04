from langchain_core.messages import HumanMessage
from langgraph.graph import END, START, StateGraph

from vision_process.src.vision_schemas import (FoodCalorieInfo, FoodConfirmation, States)
from workout_diet_planner.config.config import get_langchain_model


def check_food_node(state: States):
    llm = get_langchain_model(state["user_email"])
    if not llm:
        raise ValueError(f"Missing LLM key config, custom vision support LLM keys needed to use visoin feature")
    
    base64_image = state["base64_image"]
    message = HumanMessage(content=[
        {"type": "text", "text": "Look at this image. Is it food?"},
        {"type":"image_url", "image_url":{"url":f"data:image/jpeg;base64,{base64_image}"}}
        ]) 
    checking_structured_llm = llm.with_structured_output(FoodConfirmation) 
   
    result = checking_structured_llm.invoke([message])
    
    # Update the state
    return {"is_food":result.is_food, "status_message":result.reason}


def analyze_food_node(state:States):
    llm = get_langchain_model(state["user_email"])    
    
    # Prepare the image
    base64_image = state["base64_image"]
    
    # Construct the multimodal message
    message = HumanMessage(content=[
            {"type": "text", "text": "You are an expert nutritionist. Analyze this image, identify the food, and provide an accurate calorie estimation with a breakdown."},
            {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
            ])
    
    final_structured_output_llm = llm.with_structured_output(FoodCalorieInfo)

    result = final_structured_output_llm.invoke([message])
    
    # Update the state
    return {"calorie_info": result}


def conditional_node(state:States):
    if state.get("is_food"):
        return "analyze_food"
    return "no_food"

def graph_workflow(base64_image, user_email):

    workflow = StateGraph(States)

    workflow.add_node("check_food", check_food_node)
    workflow.add_node("analyze_food", analyze_food_node)

    workflow.add_edge(START, "check_food")
    workflow.add_conditional_edges("check_food", conditional_node, {"analyze_food":"analyze_food", "no_food":END})
    workflow.add_edge("analyze_food", END)

    app = workflow.compile()

    response = app.invoke(input={"base64_image":base64_image, "user_email":user_email})
    return response 


if __name__ == "__main__":
    
    
    output = graph_workflow(image="image.png", user_email="example@example.com")  
    print(output)
