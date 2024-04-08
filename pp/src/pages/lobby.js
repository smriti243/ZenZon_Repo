import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './lobby.css';
import io from 'socket.io-client';

// Assuming your backend is running on http://localhost:3001
const socket = io('http://localhost:3001', { withCredentials: true });

function Lobby() {
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        const challengeId = localStorage.getItem('currentChallengeId');
        if (challengeId) {
            // Emit to join the room with the challengeId
            socket.emit('joinRoom', { challengeId });

            // Fetch initial challenge details and participants
            axios.post('http://localhost:3001/api/challenge-details', { challengeId }, { withCredentials: true })
                .then(response => {
                    // Assuming the server sends an array of participant usernames
                    setParticipants(response.data.participants);
                    console.log(response.data.participants)
                })
                .catch(error => {
                    console.error('Error fetching challenge details:', error);
                });

            // Listen for new participants joining the challenge
            socket.on('updateParticipants', updatedParticipants => {
                // Expecting updatedParticipants to be an array of participant usernames
                setParticipants(updatedParticipants);
            });

            // Cleanup function to unsubscribe from events on component unmount
            return () => {
                socket.off('updateParticipants');
            };
        }
    }, []); // Ensure useEffect reruns if challengeId changes

    if (!participants.length) {
        return <div>Loading participants...</div>;
    }

    return (
        <div className="WhiteBox">
            <p className="cName1">ZENZONE</p>
            <h1 className="Your">YOUR</h1>
            <h1 className="Lobby">LOBBY</h1>
            {participants.map((participant, index) => {
                // Safely access username only if participant is not null
                if (participant) {
                    return (
                        <div key={index} className={`lobby${index + 1}`}>
                            <div className="circle1">{participant.username}</div>
                        </div>
                    );
                }
                return null; // Or handle null participants differently if needed
            })}
        </div>
    );
    
    
}

export default Lobby;
