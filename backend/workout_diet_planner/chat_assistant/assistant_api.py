import json
import sys
from typing import Optional
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from langgraph.types import Command

from api.auth import get_current_user_email
from chat_assistant.chat_assistant import graph
from config.config import redis_client, DAILY_TOKEN_LIMIT

chat_router = APIRouter()



agent_app = graph()

class ChatRequest(BaseModel):
    thread_id: str = 'thread_1'
    message: Optional[str] = None 
    resume_decision: Optional[str] = None


def debug(msg):
    print(f"[DEBUG] {msg}", file=sys.stderr, flush=True)


async def sse_generator(req: ChatRequest, email: str|None):
    config = {"configurable": {"thread_id": req.thread_id, "user_email":email}}

    if req.resume_decision:
        input_data = Command(resume=req.resume_decision)
        debug(f"Resuming thread {req.thread_id} with decision: {req.resume_decision}")
    elif req.message:
        input_data = {"messages": [{"role": "user", "content": req.message}]}
        debug(f"New message on thread {req.thread_id}: {req.message}")
    else:
        yield f"data: {json.dumps({'error': 'Must provide message or resume_decision'})}\n\n"
        return

    try:
        # stream_mode="messages" tries to yield LLM tokens.
        async for chunk, metadata in agent_app.astream(input_data, config, stream_mode="messages"):
            debug(f"CHUNK type={type(chunk).__name__} | type_attr={getattr(chunk, 'type', None)} | content={repr(getattr(chunk, 'content', None))}")

            content = getattr(chunk, "content", None)
            msg_type = getattr(chunk, "type", None)
            is_ai = msg_type in ("ai", "AIMessage", "AIMessageChunk") or "AIMessage" in type(chunk).__name__  # Some versions yield AIMessageChunk with type=='ai', some wrap differently

            if not is_ai:
                continue  
            
            # Handle structured content blocks 
            
            if isinstance(content, str):
                payload = {"type": "token", "content": content}
                yield f"data: {json.dumps(payload)}\n\n"

            elif isinstance(content, list):    # if get structured output 
                for block in content:
                    if isinstance(block, dict):
                        block_type = block.get("type", "")
                        
                        if block_type == "text":
                            text = block.get("text", "")
                            payload = {"type": "token", "content": text}
                            yield f"data: {json.dumps(payload)}\n\n"

                        elif block_type == "thinking":
                            thinking = block.get("thinking", "")
                            payload = {"type": "thinking", "content": thinking}
                            yield f"data: {json.dumps(payload)}\n\n"
                        else: 
                            text=block.get("content", "") 
                            payload = {"type": "token", "content": text}
                            yield f"data: {json.dumps(payload)}\n\n"

                    elif isinstance(block, str) and block:
                        payload = {"type": "token", "content": block}
                        yield f"data: {json.dumps(payload)}\n\n"
            else:
                text = str(content) if content is not None else ""
                payload =  {"type": "token", "content": str(content)}
                yield f"data: {json.dumps(payload)}\n\n"                               


        # Check for HITL interrupt
        state = agent_app.get_state(config)
        if state.tasks and state.tasks[0].interrupts:
            interrupt_value = state.tasks[0].interrupts[0].value
            payload = {"type": "interrupt", "content": interrupt_value}
            interrupt_json = json.dumps(payload)
            debug(f"[DEBUG] Interrupt detected: {interrupt_json}")
            yield f"data: {interrupt_json}\n\n"
        else:
            yield "data: [DONE]\n\n"
            debug("Stream finished normally.")

    except Exception as e:
        debug(f"STREAM ERROR: {e}")
        yield f"data: {json.dumps({'type': 'error', 'content': str(e)})}\n\n"


@chat_router.post("/stream")
async def chat_stream(req: ChatRequest, email: str|None = Depends(get_current_user_email)):
   
    return StreamingResponse(sse_generator(req, email), media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive", "X-Accel-Buffering": "no"}
    )



# Fetch the current daily token balance for the built-in model.
@chat_router.get("/left-tokens")
def get_remaining_tokens(email: str|None = Depends(get_current_user_email)):
        
    token_key = f"daily_tokens_{email}"
    
    remaining_tokens_str = redis_client.get(token_key)
    
    if remaining_tokens_str is None:
        remaining_tokens_str = DAILY_TOKEN_LIMIT
        
    return {"remaining_tokens": int(remaining_tokens_str), "daily_token_limit": DAILY_TOKEN_LIMIT}

# if __name__ == "__main__":
#     import uvicorn
#     uvicorn.run(app, host="0.0.0.0", port=8000)   