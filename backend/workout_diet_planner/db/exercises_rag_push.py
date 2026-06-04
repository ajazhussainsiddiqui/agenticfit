import json
import os
import sys

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.append(parent_dir)

from config.config import EMBEDDINGS_MODEL
from crud_db import get_db_connection


def create_rich_text(exercise):
    muscles = ", ".join(exercise.get("primaryMuscles", []))
    sec_muscles = ", ".join(exercise.get("secondaryMuscles", []))
    instructions = " ".join(exercise.get("instructions", []))
    
    return (
        f"{exercise['name']} is a {exercise.get('level', 'general')} "
        f"{exercise.get('mechanic', '')} {exercise.get('force', '')} exercise "
        f"using a {exercise.get('equipment', 'bodyweight')}. "
        f"Primary muscles targeted: {muscles}. "
        f"Secondary muscles: {sec_muscles}. "
        f"Instructions: {instructions}"
    )


def ingest_data(file_path):
    
    with open(file_path, 'r') as f:
        exercises = json.load(f)

    with get_db_connection() as conn:
        with conn.cursor() as cur:

            for i in range(500, len(exercises)):      # So far 499 index pushed  
                ex = exercises[i]

                rich_text = create_rich_text(ex)
                vector = EMBEDDINGS_MODEL.embed_query(rich_text)
                
                sql = """
                    INSERT INTO exercises (id, name, category, difficulty, primary_muscles, raw_json, search_text, embedding)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s) ON CONFLICT (id) DO NOTHING;
                """
                cur.execute(sql, (ex['id'], ex['name'], ex.get('category'), ex.get('level'),
                                  ex.get('primaryMuscles', []), json.dumps(ex), rich_text, vector))
                conn.commit()
                
                print(f"[DONE]: Current index {i} and ID: {ex['id']}")
        
    print("Ingestion complete!")






# if __name__ == "__main__":
#     ingest_data(file_path="workout_diet_planner/db/exercise_data/exercises.json")


