import React, {useState , useEffect} from "react";
import './RunningChallengePage.css';
import axios from "axios";

function RunningChallengePage() {
  
        const [challenge, setChallenge] = useState({});
        const [checkpoints, setCheckpoints] = useState([]);
        
        useEffect(() => {
            const challengeId = localStorage.getItem('selectedChallengeId');
            const url = `http://localhost:3001/api/running-challenge-details/${challengeId}`;
        
            axios.get(url)
              .then(response => {
                setChallenge(response.data.challenge);
                setCheckpoints(response.data.checkpoints); // Assuming you have a state for checkpoints
              })
              .catch(error => {
                console.error("Failed to fetch challenge details:", error);
              });
        }, []);
        
      
        return (
          <div className="RunningChallengeWhiteBox">
            <h1 className="ChallengeName">{challenge.chName}</h1>
           <div className="ChallengeDetailsBox">
           <p>Description: {challenge.chDescription}</p>
           <p>Deadline: {challenge.chDeadline}</p>
           <p>Format: {challenge.chFormat}</p>
           <p>Stakes: {challenge.chStakes}</p>
           {/* <p>Participants: {challenge.participants.length}</p> */}
           </div>
            {/* Render other challenge details as needed */}
            <div className="CheckpointsContainer">
                {checkpoints.map((checkpoint, index) => (
                    <div key={index} className="CheckpointBox" style={{ marginLeft: `${index * 20}px` }}>
                        <p>Checkpoint {index + 1}: {checkpoint.description}</p>
                        <p>Date: {checkpoint.date}</p>
                        <button className="uploadProgressBtn">UPLOAD PROGRESS</button>
                    </div>
                ))}
            </div>
          </div>
        );
      }


export default RunningChallengePage;