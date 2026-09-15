from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from urllib.parse import urlparse, urlunparse
import requests


# ---------------------------------
# FastAPI App
# ---------------------------------

app = FastAPI(title="MY Search Engine")


# ---------------------------------
# CORS
# ---------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------
# SearXNG Configuration
# ---------------------------------

SEARXNG_URL = "http://localhost:8080"


# ---------------------------------
# Home Route
# ---------------------------------

@app.get("/")
def home():
    return {
        "message": "My Search Engine Backend is running!"
    }


# ---------------------------------
# URL Normalization
# ---------------------------------

def normalize_url(url):
    """
    Clean a URL so duplicate pages
    can be detected.
    """

    if not url:
        return None

    try:
        parsed = urlparse(url)

        if not parsed.scheme or not parsed.netloc:
            return None

        # Remove fragments such as #section
        cleaned = parsed._replace(fragment="")

        return urlunparse(cleaned)

    except Exception:
        return None


# ---------------------------------
# Relevance Scoring
# ---------------------------------

def calculate_score(result, query):
    """
    Calculate our own relevance score
    for a search result.
    """

    query = query.lower().strip()

    title = result["title"].lower()
    url = result["url"].lower()
    content = result["content"].lower()

    query_words = query.split()

    score = 0

    # ---------------------------------
    # 1. Exact phrase in title
    # ---------------------------------

    if query in title:
        score += 60

    # ---------------------------------
    # 2. Exact phrase in URL
    # ---------------------------------

    if query in url:
        score += 25

    # ---------------------------------
    # 3. Exact phrase in content
    # ---------------------------------

    if query in content:
        score += 15

    # ---------------------------------
    # 4. Individual query words
    # ---------------------------------

    for word in query_words:

        if len(word) < 2:
            continue

        # Word appears in title
        if word in title:
            score += 15

        # Word appears in URL
        if word in url:
            score += 5

        # Word appears in content
        if word in content:
            score += 3

    # ---------------------------------
    # 5. Reward title containing
    #    most/all query words
    # ---------------------------------

    title_matches = sum(
        1 for word in query_words
        if word in title
    )

    if query_words:

        title_match_ratio = (
            title_matches / len(query_words)
        )

        # All query words appear in title
        if title_match_ratio == 1:
            score += 30

        # At least half the query words
        elif title_match_ratio >= 0.5:
            score += 15

    # ---------------------------------
    # 6. Keyword frequency bonus
    # ---------------------------------
    # Limit the bonus so pages that
    # repeat keywords excessively do
    # not dominate the ranking.

    for word in query_words:

        if len(word) < 2:
            continue

        occurrences = content.count(word)

        score += min(occurrences, 5)

    return score


# ---------------------------------
# Process Search Results
# ---------------------------------

def process_results(raw_results, limit, query):
    """
    Clean, filter, classify, rank and
    return search results.
    """

    processed = []

    seen_urls = set()

    # ---------------------------------
    # Process every SearXNG result
    # ---------------------------------

    for result in raw_results:

        title = (
            result.get("title") or ""
        ).strip()

        url = normalize_url(
            result.get("url")
        )

        content = (
            result.get("content") or ""
        ).strip()

        engine = result.get("engine")

        # Image fields
        img_src = result.get("img_src")
        thumbnail_src = result.get("thumbnail_src")

        # Video fields
        video_thumbnail = result.get("thumbnail")
        video_duration = (
            result.get("duration")
            or result.get("length")
        )
        iframe_src = result.get("iframe_src")

        # ---------------------------------
        # Ignore unusable results
        # ---------------------------------

        if not title or not url:
            continue

        # ---------------------------------
        # Remove duplicate URLs
        # ---------------------------------

        if url in seen_urls:
            continue

        seen_urls.add(url)

        # ---------------------------------
        # Determine result type
        # ---------------------------------

        result_type = "web"

        engine_name = (
            engine or ""
        ).lower()

        if "image" in engine_name:
            result_type = "image"

        elif "video" in engine_name:
            result_type = "video"

        elif "news" in engine_name:
            result_type = "news"

        # ---------------------------------
        # Add processed result
        # ---------------------------------

        processed.append({
            "title": title,
            "url": url,
            "content": content,
            "engine": engine,
            "type": result_type,

            # Image data
            "img_src": img_src,
            "thumbnail_src": thumbnail_src,

            # Video data
            "video_thumbnail": video_thumbnail,
            "video_duration": video_duration,
            "iframe_src": iframe_src
        })

    # ---------------------------------
    # Calculate our own score
    # ---------------------------------

    for result in processed:

        result["score"] = calculate_score(
            result,
            query
        )

    # ---------------------------------
    # Sort using our ranking
    # ---------------------------------

    processed.sort(
        key=lambda result: result["score"],
        reverse=True
    )

    # ---------------------------------
    # Return requested number
    # ---------------------------------

    return processed[:limit]


# ---------------------------------
# Search Endpoint
# ---------------------------------

@app.get("/search")
def search(
    q: str,
    limit: int = 10,
    category: str = "general"
):

    try:

        # ---------------------------------
        # Ask SearXNG for search results
        # ---------------------------------

        response = requests.get(
            f"{SEARXNG_URL}/search",

            params={
                "q": q,
                "format": "json",
                "categories": category,
                "results_on_new_page": 30
            },

            timeout=10
        )

        # ---------------------------------
        # Check HTTP response
        # ---------------------------------

        response.raise_for_status()

        # ---------------------------------
        # Convert response to JSON
        # ---------------------------------

        data = response.json()

        # ---------------------------------
        # Get raw results
        # ---------------------------------

        raw_results = data.get(
            "results",
            []
        )

        # ---------------------------------
        # Process our results
        # ---------------------------------

        results = process_results(
            raw_results,
            limit,
            q
        )

        # ---------------------------------
        # Return API response
        # ---------------------------------

        return {
            "query": q,
            "category": category,
            "results": results,
            "total": len(results)
        }

    # ---------------------------------
    # Handle SearXNG connection errors
    # ---------------------------------

    except requests.exceptions.RequestException as e:

        return {
            "error": "Unable to connect to SearXNG",
            "details": str(e)
        }