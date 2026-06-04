import os
import sys
from urllib import response
from langchain_core.documents import Document

from config.config import EMBEDDINGS_MODEL, SEMANTIC_COMPARISON_MODEL
from db.crud_db import get_db_connection


#  Retrieve exercises using vector cosine distance (embedding <-> query).
def vector_search(query_text, difficulty='beginner', limit = 15):
    
    query_vector = EMBEDDINGS_MODEL.embed_query(query_text)  # Embed the text query document once

    docs = []
    sql = """
        SELECT raw_json, search_text
        FROM exercises
        WHERE difficulty = %s
        ORDER BY embedding <-> %s::vector
        LIMIT %s
    """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (difficulty, query_vector, limit))
            rows = cur.fetchall()
            for row in rows:
                doc = Document(page_content=row[1], metadata=row[0])
                docs.append(doc)
    return docs


#  Full-text search (BM25-like via PostgreSQL tsvector)
def fts_search(query_text, difficulty='beginner', limit = 10):

    docs = []
    sql = """
            WITH q AS (
                SELECT replace(plainto_tsquery('english', %s)::text, '&', '|')::tsquery AS query
            )
            SELECT raw_json, search_text, ts_rank(fts_vector, q.query) AS rank
            FROM exercises, q
            WHERE fts_vector @@ q.query
            AND difficulty = %s
            ORDER BY rank DESC
            LIMIT %s;
        """
    with get_db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(sql, (query_text, difficulty, limit))
            rows = cur.fetchall()
            for row in rows:
                doc = Document(page_content=row[1], metadata=row[0])
                docs.append(doc)
    return docs



def get_workouts(query_text, difficulty, method=None, limit=None):

    if method=='vector':
       vector_docs = vector_search(query_text, difficulty, limit=limit) 
       return rerank_workout(query_text, retrieve_docs=vector_docs, limit=limit)
    elif method=='fts':
        fts_docs = fts_search(query_text, difficulty, limit=limit)
        return rerank_workout(query_text, retrieve_docs=fts_docs, limit=limit)
    else: 
        vector_docs = vector_search(query_text, difficulty, limit=limit) 
        fts_docs = fts_search(query_text, difficulty, limit=limit)

        seen_id = set()
        combined = []
        for doc in vector_docs + fts_docs:
            wo_id= doc.metadata.get('id')
            if wo_id not in seen_id:
                seen_id.add(wo_id)
                combined.append(doc)
        
        return rerank_workout(query_text, retrieve_docs=combined, limit=limit)
    
              
# ranking retrieve documents using "cross-encoder/ms-marco-MiniLM-L-6-v2" symantic comparision score model
def rerank_workout(query_text, retrieve_docs, limit):
    
    input_pairs = [[query_text, doc.page_content] for doc in retrieve_docs]
    
    score_list = SEMANTIC_COMPARISON_MODEL.predict(input_pairs)
    docs_scores_zip = list(zip(retrieve_docs, score_list))
    docs_scores_zip.sort(key=lambda x:x[1], reverse=True)

    relevence_workout = [{round(float(score), 3):doc.metadata} for doc, score in docs_scores_zip[:limit]]
    
    return relevence_workout
    



if __name__ == "__main__":
    query_text =  """A perfect exercise targets the chest and triceps using bodyweight. It is highly stable"""
    response = get_workouts(query_text, difficulty='beginner', method='fts', limit=5)
    # response =  vector_search(query_text, difficulty='beginner')
    # response =  fts_search(query_text, difficulty='beginner')
    print(response)