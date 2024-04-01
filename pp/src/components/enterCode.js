import React, { useState } from 'react';
import './enterCode.css';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';

function EnterCode({ onClose, onJoinSuccess }) { // Assuming onJoinSuccess is a prop function to handle post-join logic
  const [code2, setCode2] = useState("");
  const navigate = useNavigate();


  const handleSubmitCode = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/join-challenge', { inviteCode:code2}, { withCredentials: true });
      console.log(response.data.message);
      
      // Assuming the server responds with the challengeId that the user joined
      if(response.data.challengeId) {
        // Store the challengeId in local storage
        localStorage.setItem('currentChallengeId', response.data.challengeId);
        
        // Execute the onJoinSuccess callback, passing the challengeId
        if (onJoinSuccess) {
          onJoinSuccess(response.data.challengeId);
        }
        
        // Redirect or perform another action to move the user to the lobby or relevant page
        navigate(`/lobby`); // Adjust the navigation path as needed
        onClose(); // Assuming onClose is meant to close the popup
      } else {
        alert("Failed to get challenge details. Please try again.");
      }
    } catch (error) {
      console.error("Failed to join the challenge:", error.response?.data?.message || error.message);
      alert(error.response?.data?.message || "Error joining challenge.");
    }
  };


  return (
    <div className="popup">
      <div className="popup-inner">
        <h3 className='heading'>ENTER INVITE CODE</h3>
        <form onSubmit={handleSubmitCode}> {/* Add a form to handle submission */}
          <input type="text" className="inputcode" value={code2} onChange={(e) => setCode2(e.target.value)} />
          <br /><br />
          <button type="submit" className="popupbtn">JOIN</button> {/* Submit button */}
        </form>
        <button className="popupbtn" onClick={onClose}>CLOSE</button>
      </div>
    </div>
  );
}

export default EnterCode;
