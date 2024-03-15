import React, { useState } from 'react';
import './enterCode.css';
import axios from 'axios'; // Make sure to import axios

function EnterCode({ onClose, onJoinSuccess }) { // Assuming onJoinSuccess is a prop function to handle post-join logic
  const [code2, setCode2] = useState("");

  const handleSubmitCode = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    try {
      // Replace with the actual endpoint URL and ensure you handle the user ID correctly
      const response = await axios.post('http://localhost:3001/join-challenge', { inviteCode: code2 });
      console.log(response.data.message); // Log or display a success message
      onJoinSuccess(response.data.challengeId); // Handle successful join, e.g., redirect or close popup
    } catch (error) {
      // Handle errors, such as showing an alert or updating the UI with the error message
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
