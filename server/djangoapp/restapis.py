import os
import requests
from dotenv import load_dotenv


load_dotenv()

# Base URLs for backend services with sensible defaults
backend_url = os.getenv("backend_url", default="http://localhost:3030")
sentiment_analyzer_url = os.getenv(
    "sentiment_analyzer_url",
    default="http://localhost:5050/",
)


def get_request(endpoint: str, **kwargs):
    """Perform a GET request against the backend service."""
    params = ""
    if kwargs:
        for key, value in kwargs.items():
            params = params + key + "=" + value + "&"
    request_url = backend_url + endpoint + "?" + params
    print(f"GET from {request_url} ")
    try:
        response = requests.get(request_url)
        return response.json()
    except Exception:
        # If any error occurs
        print("Network exception occurred")


def analyze_review_sentiments(text: str):
    """Call sentiment analysis service and return the response."""
    request_url = sentiment_analyzer_url + "analyze/" + text
    try:
        response = requests.get(request_url)
        return response.json()
    except Exception as err:
        print(f"Unexpected {err=}, {type(err)=}")
        print("Network exception occurred")


def post_review(data_dict: dict):
    """Post a review to the backend service."""
    request_url = backend_url + "/insert_review"
    try:
        response = requests.post(request_url, json=data_dict)
        print(response.json())
        return response.json()
    except Exception:
        print("Network exception occurred")
