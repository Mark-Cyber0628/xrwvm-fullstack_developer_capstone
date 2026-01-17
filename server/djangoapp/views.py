"""View functions for user authentication, dealer data, and reviews."""

import json
import logging

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .models import CarMake, CarModel
from .populate import initiate
from .restapis import get_request, analyze_review_sentiments, post_review


# Configure module-level logger
logger = logging.getLogger(__name__)


@csrf_exempt
def login_user(request):
    """Handle user login."""
    data = json.loads(request.body)
    username = data["userName"]
    password = data["password"]
    user = authenticate(username=username, password=password)
    response_data = {"userName": username}
    if user is not None:
        login(request, user)
        response_data["status"] = "Authenticated"
    return JsonResponse(response_data)


@csrf_exempt
def logout_user(request):
    """Handle user logout."""
    logout(request)
    return JsonResponse({"userName": ""})


@csrf_exempt
def registration(request):
    """Handle user registration."""
    data = json.loads(request.body)
    username = data["userName"]
    password = data["password"]
    first_name = data.get("firstName", "")
    last_name = data.get("lastName", "")
    email = data.get("email", "")

    if User.objects.filter(username=username).exists():
        return JsonResponse({"error": "Already Registered"})

    user = User.objects.create_user(
        username=username,
        password=password,
        first_name=first_name,
        last_name=last_name,
        email=email,
    )
    login(request, user)
    return JsonResponse({"userName": username, "status": "Authenticated"})


def get_dealerships(request, state: str = "All"):
    """Return dealers list optionally filtered by state."""
    if state == "All":
        endpoint = "/fetchDealers"
    else:
        endpoint = "/fetchDealers/" + state
    dealerships = get_request(endpoint)
    return JsonResponse({"status": 200, "dealers": dealerships})


def get_dealer_details(request, dealer_id: int):
    """Return details for a single dealer."""
    if dealer_id:
        endpoint = "/fetchDealer/" + str(dealer_id)
        dealership = get_request(endpoint)
        return JsonResponse({"status": 200, "dealer": dealership})
    return JsonResponse({"status": 400, "message": "Bad Request"})


def get_dealer_reviews(request, dealer_id: int):
    """Return reviews for a dealer with sentiment analysis."""
    if dealer_id:
        endpoint = "/fetchReviews/dealer/" + str(dealer_id)
        reviews = get_request(endpoint)
        for review_detail in reviews:
            sentiment_response = analyze_review_sentiments(
                review_detail.get("review", "")
            )
            if (
                sentiment_response
                and isinstance(sentiment_response, dict)
                and "sentiment" in sentiment_response
            ):
                review_detail["sentiment"] = sentiment_response["sentiment"]
            else:
                review_detail["sentiment"] = "neutral"
        return JsonResponse({"status": 200, "reviews": reviews})
    return JsonResponse({"status": 400, "message": "Bad Request"})


def get_cars(request):
    """Return list of car models with their make."""
    count = CarMake.objects.filter().count()
    if count == 0:
        initiate()
    car_models = CarModel.objects.select_related("car_make")
    cars = []
    for car_model in car_models:
        cars.append(
            {
                "CarModel": car_model.name,
                "CarMake": car_model.car_make.name,
            }
        )
    return JsonResponse({"CarModels": cars})


def add_review(request):
    """Handle posting a new review."""
    if not request.user.is_anonymous:
        data = json.loads(request.body)
        try:
            post_review(data)
            return JsonResponse({"status": 200})
        except Exception as exc:  # noqa: B902
            logger.error("Error posting review: %s", exc)
            return JsonResponse(
                {"status": 401, "message": "Error in posting review"}
            )
    return JsonResponse({"status": 403, "message": "Unauthorized"})
