import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './lobby.css';
import io from 'socket.io-client';

const socket = io('http://localhost:3001', { withCredentials: true });

function Lobby() {
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        const challengeId = localStorage.getItem('currentChallengeId');
        if (challengeId) {
            socket.emit('joinRoom', { challengeId });

            axios.post('http://localhost:3001/api/challenge-details', { challengeId }, { withCredentials: true })
                .then(response => {
                    setParticipants(response.data.participants);
                    console.log(response.data.participants);
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
                socket.emit('leaveRoom', { challengeId });  // Ensure to leave the room when component unmounts
            };
        }
    }, [socket]);  // Depend on socket to ensure stable reference

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
        </div>
    );
}

export default Lobby;
