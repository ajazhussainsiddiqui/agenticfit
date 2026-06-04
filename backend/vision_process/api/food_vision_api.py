import base64

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from vision_process.src.graph import graph_workflow
from workout_diet_planner.api.auth import get_current_user_email

food_router = APIRouter()


@food_router.post("/food_image_process")
def food_image_process(file:UploadFile, email: str|None = Depends(get_current_user_email)):
    if file.size >  10 * 1024 * 1024: # max 10 MB limit
        raise HTTPException(status_code=413, detail=f"Max limit is 10 MB and uploaded size {file.size}")
    try:   
        file_bytes =  file.file.read()

        base64_image = base64.b64encode(file_bytes).decode('utf-8')   
        
        output = graph_workflow(base64_image=base64_image, user_email=email)
        
        return {"is_food": output.get('is_food'), "status_message":output.get('status_message'), "calorie_info":output.get('calorie_info')}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CHECK LLM CONFIG may reason of error. ERROR: {str(e)}")