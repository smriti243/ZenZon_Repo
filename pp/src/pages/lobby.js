import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './lobby.css';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom'; // For programmatic navigation

const socket = io('http://localhost:3001', { withCredentials: true });

function Lobby() {
    const [participants, setParticipants] = useState([]);
    const [isCreator, setIsCreator] = useState(false);
    const navigate = useNavigate(); // Hook for navigation

    useEffect(() => {
        const challengeId = localStorage.getItem('currentChallengeId');
        const userId = localStorage.getItem('userId'); // Assuming you store the current user's ID in localStorage

        if (challengeId) {
            socket.emit('joinRoom', { challengeId });

            axios.post('http://localhost:3001/api/challenge-details', { challengeId }, { withCredentials: true })
                .then(response => {
                    setParticipants(response.data.participants);
                    // Determine if the current user is the creator
                    setIsCreator(response.data.createdBy === userId);
                })
                .catch(error => {
                    console.error('Error fetching challenge details:', error);
                });

            const handleUpdateParticipants = updatedParticipants => {
                setParticipants(updatedParticipants);
            };

            socket.on('updateParticipants', handleUpdateParticipants);

            return () => {
                socket.off('updateParticipants', handleUpdateParticipants);
                socket.emit('leaveRoom', { challengeId });
            };
        }
    }, [socket]); // Depend on socket to ensure stable reference

    if (!participants.length) {
        return <div>Loading participants...</div>;
    }

    return (
        <div className="WhiteBox">
            <p className="cName1">ZENZONE</p>
            <h1 className="Your">YOUR</h1>
            <h1 className="Lobby">LOBBY</h1>
            {participants.map((participant, index) => (
                <div key={index} className={`lobby${index + 1}`}>
                    <div className="circle1">{participant.username}</div>
                </div>
            ))}
            {isCreator && (
                <button className='checkpointBtn' onClick={() => navigate('/checkpoint')}>Proceed to Checkpoint</button>
            )}
        </div>
    );
}

export default Lobby;
