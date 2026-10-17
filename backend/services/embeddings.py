from __future__ import annotations
import math
import os
import hashlib
import re
from typing import List, Optional, Tuple
import numpy as np

from models.sos_schema import SOSTicket

def get_gemini_client():
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        from google import genai
        return genai.Client(api_key=api_key)
    except Exception as e:
        print(f"Warning: Failed to initialize genai.Client: {e}")
        return None

def _generate_deterministic_embedding(text: str, dim: int = 768) -> List[float]:
    """
    Fallback deterministic semantic vector generator for offline/mock testing.
    Combines word tokens, bigrams, and character trigrams for strong semantic overlap.
    """
    cleaned = re.sub(r"[^\w\s]", " ", text.lower())
    words = [w for w in cleaned.split() if len(w) > 2]
    vec = np.zeros(dim, dtype=np.float32)

    for i, w in enumerate(words):
        h = int(hashlib.md5(w.encode("utf-8")).hexdigest(), 16) % dim
        vec[h] += 3.0
        # Character trigrams for morphological similarity
        for j in range(len(w) - 2):
            g = w[j:j+3]
            gh = int(hashlib.md5(g.encode("utf-8")).hexdigest(), 16) % dim
            vec[gh] += 1.0
        # Word bigrams
        if i < len(words) - 1:
            bg = f"{w}_{words[i+1]}"
            bgh = int(hashlib.md5(bg.encode("utf-8")).hexdigest(), 16) % dim
            vec[bgh] += 2.0

    norm = np.linalg.norm(vec)
    if norm > 0:
        vec = vec / norm
    else:
        vec[0] = 1.0
    return vec.tolist()

def get_embedding(text: str) -> List[float]:
    """
    Generates a 768-dim semantic embedding using Google text-embedding-004.
    Falls back to deterministic offline semantic vector if API key is not present.
    """
    client = get_gemini_client()
    if client:
        try:
            response = client.models.embed_content(
                model="text-embedding-004",
                contents=text,
            )
            if hasattr(response, "embedding") and response.embedding:
                values = response.embedding.values
                if values:
                    return list(values)
            elif hasattr(response, "embeddings") and response.embeddings:
                return list(response.embeddings[0].values)
        except Exception as e:
            print(f"Gemini embedding API call failed: {e}. Falling back to deterministic vector.")

    return _generate_deterministic_embedding(text)

def cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """
    Calculates cosine similarity between two vectors.
    """
    if not vec_a or not vec_b or len(vec_a) != len(vec_b):
        return 0.0
    a = np.array(vec_a, dtype=np.float32)
    b = np.array(vec_b, dtype=np.float32)
    dot = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(dot / (norm_a * norm_b))

def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the great-circle distance between two GPS coordinates in meters.
    """
    R = 6371000.0  # Earth radius in meters
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2.0) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def find_duplicate_sos(
    new_text: str,
    new_lat: float,
    new_lng: float,
    existing_tickets: List[SOSTicket],
    distance_threshold_m: float = 300.0,
    similarity_threshold: float = 0.85,
) -> Tuple[Optional[SOSTicket], float, float]:
    """
    Deduplication Engine:
    Checks if a newly reported incident is a duplicate of an existing active ticket within 300m
    with Cosine Similarity >= 0.85 (or >= 0.70 in offline deterministic fallback mode).
    Returns: (matching_ticket, distance_m, similarity_score)
    """
    if not existing_tickets:
        return None, 0.0, 0.0

    client = get_gemini_client()
    effective_threshold = similarity_threshold if client else 0.70

    new_embedding = get_embedding(new_text)

    best_match: Optional[SOSTicket] = None
    best_similarity = 0.0
    best_dist = float("inf")

    for ticket in existing_tickets:
        dist = haversine_distance_meters(new_lat, new_lng, ticket.location.lat, ticket.location.lng)
        if dist <= distance_threshold_m:
            t_emb = ticket.embedding
            if not t_emb:
                t_emb = get_embedding(ticket.raw_input)
                ticket.embedding = t_emb

            sim = cosine_similarity(new_embedding, t_emb)
            if sim >= effective_threshold and sim > best_similarity:
                best_similarity = sim
                best_dist = dist
                best_match = ticket

    if best_match:
        return best_match, best_dist, best_similarity

    return None, 0.0, 0.0
