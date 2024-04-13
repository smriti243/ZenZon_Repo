import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './popup.css';

axios.defaults.withCredentials = true;

function Popup({ onClose }) {
  const [challenges, setChallenges] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:3001/api/running-challenges')
      .then(response => {
        setChallenges(response.data);
      })
      .catch(error => {
        console.error("There was an error fetching the challenges:", error);
      });
  }, []);

  const handleChallengeClick = (id) => {
    localStorage.setItem('selectedChallengeId', id);
    navigate('/RunningChallengePage'); // Navigate to a generic details page
  };

  return (
    <div className="popup">
      <div className="popup-inner">
        <h3 className='heading'>RUNNING CHALLENGES</h3>
        {challenges.map(challenge => (
          <p key={challenge._id} onClick={() => handleChallengeClick(challenge._id)}>
            {challenge.chName}
          </p>
        ))}
        <button className="popupbtn" onClick={onClose}>CLOSE</button>
      </div>
    </div>
  );
}

export default Popup;
