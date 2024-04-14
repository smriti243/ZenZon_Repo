import React, { useEffect, useState } from "react";
import axios from 'axios';
import './wallOfShame.css';

function WallOfShame() {
        const [challenges, setChallenges] = useState([]);
    
        useEffect(() => {
            axios.get('http://localhost:3001/api/wall-of-shame')
                .then(response => {
                    setChallenges(response.data);
                })
                .catch(error => {
                    console.error('Failed to fetch images for the Wall of Shame:', error);
                });
        }, []);

   return(
 <div className="wallOfShameWhiteBox">
    <h1 className="WallOf">WALL OF </h1>
    <h1 className="Shame">SHAME</h1>
    <div className="imagesContainer">
                {challenges.map(function(challenge, index) {
                    const imageUrl = 'http://localhost:3001/' + challenge.stakeImagePath;
                    const altText = 'Challenge ' + challenge.chName;
                    return (
                        <div key={index} className="shameImageContainer">
                            <img src={imageUrl} alt={altText} />
                            <p>{challenge.chName}</p>
                        </div>
                    );
                })}
            </div>
 </div>
   )
}

export default WallOfShame;