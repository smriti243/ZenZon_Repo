import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './popup.css';

axios.defaults.withCredentials= true;

function Popup({ onClose }) {
  const [challenges, setChallenges] = useState([]);

  useEffect(() => {
    // Replace the URL with your actual endpoint URL
    axios.get('http://localhost:3001/api/running-challenges')
      .then(response => {
        console.log(response.data);
        setChallenges(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the challenges:", error);
      });
  }, []);

  return (
    <div className="popup">
      <div className="popup-inner">
        <h3 className='heading'>RUNNING CHALLENGES</h3>
        {challenges.map(challenge => (
          <p key={challenge._id}>{challenge.chName}</p>
        ))}
        <button className="popupbtn" onClick={onClose}>CLOSE</button>
      </div>
    </div>
  );
}

export default Popup;
