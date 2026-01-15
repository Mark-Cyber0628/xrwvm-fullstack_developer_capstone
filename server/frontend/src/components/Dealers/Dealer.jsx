import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Dealers.css';
import '../assets/style.css';
import positive_icon from '../assets/positive.png';
import neutral_icon from '../assets/neutral.png';
import negative_icon from '../assets/negative.png';
import review_icon from '../assets/reviewbutton.png';
import Header from '../Header/Header';

const Dealer = () => {
  // Route parameter for dealer ID
  const { id } = useParams();

  // Local state
  const [dealer, setDealer] = useState({});
  const [reviews, setReviews] = useState([]);
  const [unreviewed, setUnreviewed] = useState(false);
  const [postReviewLink, setPostReviewLink] = useState(null);

  // Construct base API URL using location.origin to avoid brittle substring logic
  const rootUrl = `${window.location.origin}/`;
  const dealerUrl = `${rootUrl}djangoapp/dealer/${id}`;
  const reviewsUrl = `${rootUrl}djangoapp/reviews/dealer/${id}`;
  const postReviewUrl = `${rootUrl}postreview/${id}`;

  const fetchDealer = async () => {
    try {
      const res = await fetch(dealerUrl, {
        method: 'GET',
        credentials: 'include',
      });
      const retobj = await res.json();
      if (retobj.status === 200) {
        const dealerobjs = Array.from(retobj.dealer || []);
        if (dealerobjs.length > 0) {
          setDealer(dealerobjs[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching dealer details:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await fetch(reviewsUrl, {
        method: 'GET',
        credentials: 'include',
      });
      const retobj = await res.json();
      if (retobj.status === 200) {
        if (Array.isArray(retobj.reviews) && retobj.reviews.length > 0) {
          setReviews(retobj.reviews);
        } else {
          setUnreviewed(true);
        }
      }
    } catch (error) {
      console.error('Error fetching dealer reviews:', error);
    }
  };

  /**
   * Determine which sentiment icon to display based on the review’s
   * sentiment property.
   */
  const sentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'positive':
        return positive_icon;
      case 'negative':
        return negative_icon;
      default:
        return neutral_icon;
    }
  };

  // Fetch dealer and reviews on mount and whenever the ID changes
  useEffect(() => {
    fetchDealer();
    fetchReviews();
  }, [id]);

  // Determine whether to show the Post Review button based on login state
  useEffect(() => {
    const username = sessionStorage.getItem('username');
    if (username) {
      setPostReviewLink(
        <a href={postReviewUrl} aria-label="Post Review">
          <img
            src={review_icon}
            style={{ width: '10%', marginLeft: '10px', marginTop: '10px' }}
            alt="Post Review"
          />
        </a>,
      );
    } else {
      setPostReviewLink(null);
    }
  }, [postReviewUrl]);

  return (
    <div style={{ margin: '20px' }}>
      <Header />
      <div style={{ marginTop: '10px' }}>
        <h1 style={{ color: 'grey' }}>
          {dealer.full_name}
          {postReviewLink}
        </h1>
        <h4 style={{ color: 'grey' }}>
          {dealer.city},{dealer.address}, Zip - {dealer.zip}, {dealer.state}
        </h4>
      </div>
      <div className="reviews_panel">
        {reviews.length === 0 && !unreviewed ? (
          <span>Loading Reviews....</span>
        ) : unreviewed ? (
          <div>No reviews yet!</div>
        ) : (
          reviews.map((review, index) => (
            <div className="review_panel" key={index}>
              <img
                src={sentimentIcon(review.sentiment)}
                className="emotion_icon"
                alt="Sentiment"
              />
              <div className="review">{review.review}</div>
              <div className="reviewer">
                {review.name} {review.car_make} {review.car_model} {review.car_year}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dealer;
