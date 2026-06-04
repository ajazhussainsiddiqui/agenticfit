from langchain_core.messages import AIMessage, ToolMessage
from langchain_core.runnables import RunnableConfig
from langgraph.checkpoint.memory import InMemorySaver
from langgraph.graph import END, START, MessagesState, StateGraph
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.types import Command, interrupt
import json

from config.config import MISTRAL_MODEL, get_langchain_model, redis_client, DAILY_TOKEN_LIMIT
from db.db_chat_tools import db_tools_list


# Sanitize AIMessage response to strip thinking blocks, to ensures the checkpointer saves the clean version.
def  _sanitize_aimessage_response(msg):

    if not isinstance(msg, AIMessage):
        return msg
    
    content = getattr(msg, "content", None)
    
    if isinstance(content, str): # Already a string, no thinking blocks to strip
        return msg
    
    # if messages in structured dictionary, extract onlyt text blocks, skip thinking blocks
    if isinstance(content, list):
            has_thinking = any(isinstance(b, dict) and b.get("type") == "thinking" for b in content)
            if not has_thinking:
                return msg  # No thinking blocks — return as it is
            
            text_parts = []
            for block in content:
                if isinstance(block, dict) and block.get("type") == "text":
                    text_parts.append(block.get("text", "")) 
                elif isinstance(block, str):
                    text_parts.append(block)
            
            clean_content = "\n".join(text_parts).strip()               
            sanitize_msg = msg.model_copy(update={"content":clean_content})     # replace msg content with clean content (no thinking block) in msg block
            return sanitize_msg     
    return msg    # reutrn msg as it is, if doesn't list structured


def call_model(state: MessagesState, config: RunnableConfig):
    user_email = config.get('configurable', {}).get('user_email')
    
    custom_llm = get_langchain_model(user_email)
    
    if custom_llm:
        # print(f"[DEBUG] Using custom model of email '{user_email}'")
        llm_with_tool = custom_llm.bind_tools(tools=db_tools_list)        
        try:
            response = llm_with_tool.invoke(state['messages'])
            response = _sanitize_aimessage_response(response)       # sanitize before save in msg history
            return {'messages': [response]}
        except Exception as e:
            print(f"[ERROR] LLM Invocation failed: {str(e)}")
            raise e   
     
    else:
        # print("[DEBUG] No custom config found. Falling back to built-in model.")    
        token_key = f"daily_tokens_{user_email}"
        remaining_tokens_str = redis_client.get(token_key)   # redis return string
        
        if remaining_tokens_str is None:   #  if token_key does't exist in redis, Initialize token balance with 24 hours (86400 seconds) expiration
            redis_client.setex(token_key, 86400, DAILY_TOKEN_LIMIT) 
            remaining_tokens = DAILY_TOKEN_LIMIT
        else:
            remaining_tokens = int(remaining_tokens_str)

        if remaining_tokens <=0:
            print(f"[WARNING] User {user_email} reached their daily token limit.")
            limit_msg = "You have reached your daily token limit for the built-in model. Please configure your own API key in the 'LLM Config' to continue immediately or wait until tomorrow to reset token limit ⏳."
            return {'messages': [AIMessage(content=limit_msg)]} 
        
        llm_with_tool = MISTRAL_MODEL.bind_tools(tools=db_tools_list)
        
        try:
            response = llm_with_tool.invoke(state['messages'])
            
            usages = getattr(response, "usage_metadata", None)
            if usages:
                tokens_used = usages.get("total_tokens", 0)
                redis_client.decrby(token_key, tokens_used)  # Atomically decrement the used tokens from Redis
                # print(f"[DEBUG] User '{user_email}' used {tokens_used} tokens. Remaining: {new_balance}")
            response = _sanitize_aimessage_response(response)       # sanitize before save in msg history
            return {'messages': [response]}
        
        except Exception as e:
            print(f"[ERROR] LLM Invocation failed: {str(e)}")
            raise e        



def approval_node(state: MessagesState):
 
    last_msg = state['messages'][-1]

    if not hasattr(last_msg, 'tool_calls') or not last_msg.tool_calls:
        return Command(goto="llm")  # Route back to LLM if no tool calls
    
    sensitive_tools = {"manage_health_metrics", "manage_dietary_profile", "manage_daily_logs", "manage_user_name"}
    risky_actions = {"insert", "update", "delete"}
    
    pending = []
   
    for tc in last_msg.tool_calls:
        action = tc['args'].get('action')
        if tc['name'] in sensitive_tools and action in risky_actions:
            # formatted_action = f"Tool: {tc['name']} | Arguments: {tc['args']}"
            pending_op = {"tool_name": tc['name'], "action": action, "arguments": tc['args']}
            pending.append(pending_op)
    
    if not pending:   # goto the tools node if no sensitive tool call 
        return Command(goto="tools")          
    
    decision = interrupt({"status": "pending_approval", "pending_operations": pending, "prompt": "Approve this operation(s)?"})
    
    
    if decision == 'no':
        # list of filter tools call that aren't risky
        filtered_tool_calls = [ tc for tc in last_msg.tool_calls 
                                if not (tc["name"] in sensitive_tools and tc["args"].get("action") in risky_actions)]

        if not filtered_tool_calls:  # if user said no and filter_tools_call list is empty then move to llm node with latest HumanMessage, about cancle tool calling
            denied_tool_messages = []
            for tc in last_msg.tool_calls:
                denied_tool_messages.append(ToolMessage(content=json.dumps({"status": "denied", "reason": "User rejected this operation via Human-in-the-Loop approval."}), tool_call_id=tc["id"],))            

            return Command(goto="llm", update={'messages':state['messages'] + denied_tool_messages})  
        
        # replace current tool call list with updated new filtered_tool_calls to remove all risky tools     
        new_msg = last_msg.model_copy(update={"tool_calls": filtered_tool_calls})
        return Command(goto='tools', update={'messages':[new_msg]})   # after removing all risky tool if there still remaining tool call (like 'seach' operation) next move to tool node to execute that tool 
   
    return Command(goto='tools')  # if decision yes then move to tools node to execute respective tool       
 


def graph():

    workflow = StateGraph(state_schema=MessagesState)
    
    workflow.add_node('llm', call_model)
    workflow.add_node('human_approval', approval_node)
    workflow.add_node('tools', ToolNode(tools=db_tools_list))
    
    workflow.add_edge(START, 'llm')
    workflow.add_conditional_edges('llm', tools_condition, {'tools':'human_approval', END:END})
    workflow.add_edge('tools', 'llm')


    app = workflow.compile(checkpointer=InMemorySaver())
    return app 



if __name__ == "__main__":
    
    app = graph()
    config = {"configurable":{"thread_id":"thread_01"}}
    
    while True:
        user_content = input("User: ")
        
        result = app.invoke({"messages":[{'role':'user', 'content': user_content}]}, config=config)
        
        while True:
            #  Check if the graph is paused waiting for an interrupt
            state = app.get_state(config)
            
            # state.tasks will contain data if the graph is suspended
            if state.tasks and state.tasks[0].interrupts:
                
                # Extract the prompt text defined inside approval_node
                interrupt_prompt = state.tasks[0].interrupts[0].value
                
                # Ask the user for their decision
                user_decision = input(f"\n[SYSTEM] {interrupt_prompt}: ") 
                
                # Resume the graph using Command, passing the user's decision
                result = app.invoke(Command(resume=user_decision), config=config)
            else:
                break

        print(f"{result}")    
        print("AI: ",result['messages'][-1].content)
