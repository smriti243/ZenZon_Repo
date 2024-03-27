import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './voting.css';

const socket = io("http://localhost:3001", { path: '/socket.io', transports: ["websocket", "polling"] });



function Voting() {
    const [userId, setUserId] = useState(null);
    const [votes, setVotes] = useState({ yes: 0, no: 0 });

    useEffect(() => {
        axios.get('http://localhost:3001/api/session', { withCredentials: true })
            .then(response => {
                setUserId(response.data.userId);
            })
            .catch(error => {
                console.error('Error fetching user ID:', error);
            });

        // Listen for vote updates from the server
        socket.on('voteUpdate', (updatedVotes) => {
            setVotes(updatedVotes); // Update the state with the new vote counts
        });

        // Clean up on component unmount
        return () => {
            socket.off('voteUpdate');
        };
    }, []);

    const submitVote = async (vote) => {
        if (!userId) {
            console.log('User ID is not set. User might not be logged in.');
            return;
        }
        try {
            await axios.post('http://localhost:3001/api/submitVote', {
                userId,
                vote
            }, { withCredentials: true });
            // The vote count update will be handled by the socket event listener
        } catch (error) {
            console.error('Error submitting vote:', error);
        }
    };

    return (
        <div className="voting">
            <h1>Are you happy?</h1>
            <button onClick={() => submitVote('yes')}>Yes ({votes.yes})</button>
            <button onClick={() => submitVote('no')}>No ({votes.no})</button>
        </div>
    );
}

export default Voting;
