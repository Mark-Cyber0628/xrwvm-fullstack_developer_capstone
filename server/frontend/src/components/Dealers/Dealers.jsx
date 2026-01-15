import React, { useState, useEffect } from 'react';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';
import review_icon from "../assets/reviewicon.png";

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  const [states, setStates] = useState([]);

  // Base endpoint for retrieving dealers
  const dealersEndpoint = "/djangoapp/get_dealers";

  const filterDealers = async (state) => {
    // Build the URL dynamically based on the selected state
    const url = state === "All" || !state
      ? dealersEndpoint
      : `${dealersEndpoint}/${state}`;
    try {
      const res = await fetch(url, { method: "GET" });
      const retobj = await res.json();
      if (retobj.status === 200) {
        const stateDealers = Array.from(retobj.dealers);
        setDealersList(stateDealers);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch dealers by state", error);
    }
  };

  const getDealers = async () => {
    try {
      const res = await fetch(dealersEndpoint, { method: "GET" });
      const retobj = await res.json();
      if (retobj.status === 200) {
        const allDealers = Array.from(retobj.dealers);
        const statesList = allDealers.map((d) => d.state);
        setStates(Array.from(new Set(statesList)));
        setDealersList(allDealers);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to fetch dealers", error);
    }
  };

  useEffect(() => {
    getDealers();
  }, []);

  // Determine if a user is logged in based on sessionStorage
  const isLoggedIn = sessionStorage.getItem("username") !== null;

  return (
    <div>
      <Header />
      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Dealer Name</th>
            <th>City</th>
            <th>Address</th>
            <th>Zip</th>
            <th>
              <select
                name="state"
                id="state"
                defaultValue=""
                onChange={(e) => filterDealers(e.target.value)}
              >
                <option value="" disabled hidden>
                  State
                </option>
                <option value="All">All States</option>
                {states.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </th>
            {isLoggedIn ? <th>Review Dealer</th> : null}
          </tr>
        </thead>
        <tbody>
          {dealersList.map((dealer) => (
            <tr key={dealer.id}>
              {/* Wrap ID in a link for consistency */}
              <td>
                <a href={`/dealer/${dealer.id}`}>{dealer.id}</a>
              </td>
              <td>
                <a href={`/dealer/${dealer.id}`}>{dealer.full_name}</a>
              </td>
              <td>{dealer.city}</td>
              <td>{dealer.address}</td>
              <td>{dealer.zip}</td>
              <td>{dealer.state}</td>
              {isLoggedIn ? (
                <td>
                  <a href={`/postreview/${dealer.id}`}>
                    <img
                      src={review_icon}
                      className="review_icon"
                      alt="Post Review"
                    />
                  </a>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dealers;