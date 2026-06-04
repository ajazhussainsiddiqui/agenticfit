import os
import sys

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.api import router

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from chat_assistant.assistant_api import chat_router
from vision_process.api.food_vision_api import food_router
from injury_model_api_inference import injury_router


app = FastAPI(
    title="Fitness & Nutrition AI API",
    description="Unified API for Vision, Injury Prediction, Diet Planning, and Advance AI assistant",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(router=chat_router, prefix="/api/v1/chat", tags=["Chat Assistant"])
app.include_router(router=injury_router, prefix="/api/v1/injury", tags=["Injury Prediction"])
app.include_router(router=food_router, prefix="/api/v1/vision", tags=["Food Vision"])
app.include_router(router=router, prefix="/api/v1/planner", tags=["Workout & Diet Planner"])


@app.get("/")
def home():
    return {"message": "Home..."}

@app.get("/health")
def health_check():
    try:
        from db.crud_db import get_db_connection;
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id FROM users;")
                   
        return {"status": "ok"}
    
    except Exception as e:
        return {"status": f"We got problem: {str(e)}"}
    

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)