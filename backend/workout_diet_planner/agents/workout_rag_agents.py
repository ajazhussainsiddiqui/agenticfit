from typing import Any, List
from langchain_core.prompts import PromptTemplate
from langgraph.graph import END, StateGraph
from typing_extensions import TypedDict

from config.config import SEMANTIC_COMPARISON_MODEL, get_langchain_model
from db.crud_db import weekly_exercise_plans
from db.exercises_rag_retriever import fts_search, vector_search
from schemas.workout_structure_output import create_weekly_plan_model
from services.workout_profile import (exercise_profile, previous_week_plan, strike_week)


# 1. Unified State
class WorkoutPlannerState(TypedDict):
    user_email: str
    raw_profile: dict
    strike_week: str
    previous_plan: dict
    user_summary: str
    hyde_document: str
    retrieved_exercises: List[Any]
    reranked_exercises: List[dict]
    final_weekly_plan: Any  # Pydantic Model Output


# 2. Node: Native Summarizer
def summarize_profile_node(state: WorkoutPlannerState):
    llm = get_langchain_model(state["user_email"])
    prompt = PromptTemplate.from_template(
        "Summarize the following user health profile, "
        "experience level, and primary goals. Keep it concise.\n"
        "Profile: {profile}\nStrike Week: {strike}\nPrev Plan: {prev}"
    )
    chain = prompt | llm
    summary = chain.invoke({"profile": state["raw_profile"], "strike": state["strike_week"], "prev": state["previous_plan"]})
    return {"user_summary": summary.content}


# Node 3: Generate Hypothetical Document (HyDE)
def generate_hyde(state: WorkoutPlannerState):
    llm = get_langchain_model(state["user_email"])
    
    prompt = PromptTemplate.from_template(
        "You are an expert physical therapist. Given the user's health profile summary:\n"
        "{summary}\n\n"
        "Write a 3-sentence description of the PERFECT, ideal exercise for them. "
        "Include the equipment used, the muscles targeted, and why it is safe for them. "
        "Do not name a specific exercise, just describe its characteristics."
    )
    
    chain = prompt | llm
    hyde_doc = chain.invoke({"summary": state["user_summary"]}).content
    
    return {"hyde_document": hyde_doc}



# Node 4: Hybrid Retrieval (Vector + FTS): Retrieve relevant exercises using both vector similarity and full-text search, then combine and deduplicate results.
def hybrid_retrieve(state: WorkoutPlannerState):

    user_experience = state['raw_profile'].get('Experience', 'beginner')

    # Perform both searches
    vector_results = vector_search(state["hyde_document"], user_experience, limit=15)
    fts_results = fts_search(state["hyde_document"], user_experience, limit=10)

    # Combine and deduplicate by exercise id (stored in metadata['id'])
    seen_ids = set()
    combined = []
    for doc in vector_results + fts_results:
        ex_id = doc.metadata.get('id')
        if ex_id not in seen_ids:
            seen_ids.add(ex_id)
            combined.append(doc)

    return {"retrieved_exercises": combined}


# Node 5: Cross-Encoder Reranking
def rerank_exercises(state: WorkoutPlannerState):
    
    docs = state["retrieved_exercises"]
    query = f"User Profile constraints: {state['user_summary']}"
    
    # Create pairs of (Query, Document)
    pairs = [[query, doc.page_content] for doc in docs]
    
    # Score the pairs
    scores = SEMANTIC_COMPARISON_MODEL.predict(pairs)
    
    # Attach scores and sort
    scored_docs = list(zip(docs, scores))
    scored_docs.sort(key=lambda x: x[1], reverse=True)
    
    # Keep Top 10 highly relevant, safe exercises, extract just the raw_json dicts
    top_exercises = [doc.metadata for doc, score in scored_docs[:10]]
    
    return {"reranked_exercises": top_exercises}


# 6. Node: Native Scheduler (Replaces CrewAI Classifier)
def schedule_workout_node(state: WorkoutPlannerState):
    user_email = state["user_email"]
    llm = get_langchain_model(user_email)
    
    # Dynamically generate the Pydantic schema based on user's workout days
    workout_days = state["raw_profile"].get('Workout Days per Week', ['Monday', 'Wednesday', 'Friday'])
    DynamicWeeklyPlan = create_weekly_plan_model(workout_days)
    
    # Bind structured output directly to the LLM
    structured_llm = llm.with_structured_output(schema=DynamicWeeklyPlan)
    
    prompt = PromptTemplate.from_template(
        "You are an expert strength and conditioning coach.\n"
        "User Constraints: {summary}\n\n"
        "Using ONLY the following safe, verified exercises retrieved from the database, "
        "create a balanced weekly workout plan for these days: {days}.\n"
        "Do NOT invent new exercises. Map them perfectly to the required output schema.\n\n"
        "Verified Exercises:\n{exercises}"
    )
    
    chain = prompt | structured_llm
    final_plan = chain.invoke({
        "summary": state["user_summary"],
        "days": ", ".join(workout_days),
        "exercises": state["reranked_exercises"]
    })
    
    return {"final_weekly_plan": final_plan}



# 4. Compile the Unified Graph
workflow = StateGraph(WorkoutPlannerState)

workflow.add_node("summarize", summarize_profile_node)
workflow.add_node("hyde", generate_hyde)              
workflow.add_node("retrieve", hybrid_retrieve)        
workflow.add_node("rerank", rerank_exercises)         
workflow.add_node("schedule", schedule_workout_node)

workflow.set_entry_point("summarize")
workflow.add_edge("summarize", "hyde")
workflow.add_edge("hyde", "retrieve")
workflow.add_edge("retrieve", "rerank")
workflow.add_edge("rerank", "schedule")
workflow.add_edge("schedule", END)

unified_planner_app = workflow.compile()


# 5. Clean Execution Function
def generate_workout_plan(user_email: str):
    initial_state = {
        "user_email": user_email,
        "raw_profile": exercise_profile(user_email),
        "strike_week": strike_week(user_email)['strike_week'],
        "previous_plan": previous_week_plan(user_email)
    }
    
    result = unified_planner_app.invoke(initial_state)
    return result["final_weekly_plan"]




def exercise_generate_save_into_db(user_email):
    print("Generating exercise plan...")
    generated_plan = generate_workout_plan(user_email)

    print("Saving into DB's exercises table...")
    response = weekly_exercise_plans(insert=True, params={'user_email':user_email, 'exercises':generated_plan.model_dump()})
    return response 



if __name__ == "__main__":
    output = generate_workout_plan(user_email="example@example.com")
    # output = exercise_generate_save_into_db(user_email = "example@example.com")
    print(output)
