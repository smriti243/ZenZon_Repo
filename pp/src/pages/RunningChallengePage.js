import React, {useState , useEffect} from "react";
import './RunningChallengePage.css';
import axios from "axios";

function RunningChallengePage() {
  
        const [challenge, setChallenge] = useState({});
        
        useEffect(() => {
            const challengeId = localStorage.getItem('selectedChallengeId');
            const url = 'http://localhost:3001/api/running-challenge-details/' + challengeId;  // Using string concatenation
            axios.get(url)
              .then(response => {
                setChallenge(response.data);
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
          </div>
        );
      }


export default RunningChallengePage;