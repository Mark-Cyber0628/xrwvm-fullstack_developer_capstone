import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Dealers.css';
import '../assets/style.css';
import Header from '../Header/Header';

const PostReview = () => {
  // Route parameter for dealer ID
  const { id } = useParams();

  // Local state variables
  const [dealer, setDealer] = useState({});
  const [review, setReview] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [date, setDate] = useState('');
  const [carmodels, setCarmodels] = useState([]);

  // Derive API endpoints from the origin to avoid brittle substring logic
  const rootUrl = window.location.origin + '/';
  const dealerUrl = rootUrl + 'djangoapp/dealer/' + id;
  const reviewUrl = rootUrl + 'djangoapp/add_review';
  const carmodelsUrl = rootUrl + 'djangoapp/get_cars';

  const postReview = async () => {
    let firstname = sessionStorage.getItem('firstname');
    let lastname = sessionStorage.getItem('lastname');
    let name = (firstname ? firstname : 'null') + ' ' + (lastname ? lastname : 'null');
    // If the first and last name are null or empty, use the username
    if (name.includes('null') || name.trim() === '') {
      name = sessionStorage.getItem('username');
    }
    // Validate required fields
    if (!model || review.trim() === '' || date === '' || year === '') {
      alert('All details are mandatory');
      return;
    }
    // Split model into make and model name
    const parts = model.split(' ');
    const make_chosen = parts[0];
    const model_chosen = parts.slice(1).join(' ');
    const payload = {
      name: name,
      dealership: id,
      review: review,
      purchase: true,
      purchase_date: date,
      car_make: make_chosen,
      car_model: model_chosen,
      car_year: year,
    };
    try {
      const res = await fetch(reviewUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (json.status === 200) {
        // Redirect back to dealer page on success
        window.location.href = window.location.origin + '/dealer/' + id;
      } else {
        alert('Failed to submit review. Please try again later.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('An error occurred while submitting your review.');
    }
  };

  /**
   * Retrieve dealer details from the API and store in state.
   */
  const getDealer = async () => {
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

  /**
   * Retrieve the list of car models from the API and store in state.
   */
  const getCars = async () => {
    try {
      const res = await fetch(carmodelsUrl, {
        method: 'GET',
        credentials: 'include',
      });
      const retobj = await res.json();
      const carmodelsarr = Array.from(retobj.CarModels || []);
      setCarmodels(carmodelsarr);
    } catch (error) {
      console.error('Error fetching car models:', error);
    }
  };

  // Fetch dealer and car models when component mounts or ID changes
  useEffect(() => {
    getDealer();
    getCars();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <div>
      <Header />
      <div style={{ margin: '5%' }}>
        <h1 style={{ color: 'darkblue' }}>{dealer.full_name}</h1>
        <textarea
          id="review"
          cols="50"
          rows="7"
          onChange={(e) => setReview(e.target.value)}
          value={review}
        />
        <div className="input_field">
          Purchase Date <input
            type="date"
            onChange={(e) => setDate(e.target.value)}
            value={date}
            required
          />
        </div>
        <div className="input_field">
          Car Make 
          <select
            name="cars"
            id="cars"
            onChange={(e) => setModel(e.target.value)}
            value={model}
            required
          >
            <option value="" disabled hidden>
              Choose Car Make and Model
            </option>
            {carmodels.map((carmodel, index) => (
              <option
                value={carmodel.CarMake + ' ' + carmodel.CarModel}
                key={index}
              >
                {carmodel.CarMake} {carmodel.CarModel}
              </option>
            ))}
          </select>
        </div>
        <div className="input_field">
          Car Year <input
            type="number"
            onChange={(e) => setYear(e.target.value)}
            value={year}
            max={new Date().getFullYear()}
            min={2015}
            required
          />
        </div>
        <div>
          <button className="postreview" onClick={postReview}>
            Post Review
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostReview;