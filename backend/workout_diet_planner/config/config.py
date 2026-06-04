import json
import os

import redis
from crewai import LLM
from dotenv import load_dotenv
from langchain_huggingface import HuggingFaceEmbeddings, HuggingFaceEndpoint
from langchain_litellm import ChatLiteLLM
from langchain_ollama import ChatOllama
from sentence_transformers import CrossEncoder

if "SSL_CERT_FILE" in os.environ and not os.path.exists(os.environ.get("SSL_CERT_FILE", "")):
    del os.environ["SSL_CERT_FILE"]

load_dotenv()


SEMANTIC_COMPARISON_MODEL = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2', max_length=512) # CrossEncoders compare the paires of string and give its semantic scores
EMBEDDINGS_MODEL = HuggingFaceEmbeddings(model_name="BAAI/bge-large-en-v1.5", encode_kwargs={'normalize_embeddings': True})
MISTRAL_MODEL = ChatLiteLLM(model="mistral/mistral-large-latest", streaming=True)
DAILY_TOKEN_LIMIT = 50000           # daily token limit for the built-in model, reset in 24 hours 


# REDIS CLOUD INTEGRATION
REDIS_CLOUD_URL = os.getenv("REDIS_CLOUD_URL")
redis_client = redis.from_url(url=REDIS_CLOUD_URL, decode_responses=True)



def set_user_llm_config(user_email: str, provider: str, model_name: str, api_key: str = None, base_url: str = None):
    redis_key = f"byok_{user_email}"  # this use as key to store 

    if provider.lower() == "builtin-model":
       redis_client.delete(redis_key)
       print(f" [DEBUG] USER '{user_email}' back to {provider} (Cleared from Redis)")       
    else:
        key_data = {"provider": provider, "model_name": model_name, "api_key": api_key, "base_url": base_url}
        redis_client.set(name=redis_key, value=json.dumps(key_data), ex=86400)  # Serialize dict to JSON string and store with a secure TTL expiration, 24 hours Time-To-Live (TTL) in seconds redis will store it and delete after that to protect cloud memory limits
        print(f"[DEBUG] Saved BYOK config to Redis for '{user_email}'")



def _get_byok_config(user_email: str):
    redis_key = f"byok_{user_email}"
    cached_data = redis_client.get(redis_key)
    if not cached_data:
        return None
    return json.loads(cached_data)


def get_langchain_model(user_email: str):

    config = _get_byok_config(user_email)
    if not config:
        return None 
    
    provider = config.get("provider").lower() if config.get('provider') else None
    model_name = config.get("model_name") 
    api_key = config.get("api_key")
    base_url = config.get("base_url")
    
    if provider == "huggingface":
        return HuggingFaceEndpoint(repo_id = model_name, task ='text_generation', huggingfacehub_api_token = api_key, streaming=True)
    elif provider == "ollama":
        return ChatOllama(model=model_name, base_url=base_url)
    elif not provider:
        return ChatLiteLLM(model = model_name, api_key = api_key, base_url = base_url, streaming=True)
    elif provider:
        return ChatLiteLLM(model = f"{provider}/{model_name}", api_key = api_key, base_url = base_url, streaming=True)
    

   
def get_crew_model(user_email: str):

    config = _get_byok_config(user_email)    
    if not config:
       raise ValueError("No BYOK (LLM config found). Custom LLM required for plan generation.")

    provider = config.get("provider").lower() if config.get('provider') else None
    model_name = config.get("model_name")
    api_key = config.get("api_key")
    base_url = config.get("base_url")

    if provider:
        model_string = f"{provider}/{model_name}"
    else:
        model_string = model_name

    # CrewAI's LLM class handles LiteLLM under the hood
    return LLM(model=model_string, api_key=api_key, base_url=base_url, temperature=0.7)

