import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './voting.css';

const socket = io("http://localhost:3001", { path: '/socket.io', transports: ["websocket", "polling"] });

function Voting() {
    const [userId, setUserId] = useState(null);
    const [votes, setVotes] = useState({ yes: 0, no: 0 });
    const [hasVoted, setHasVoted] = useState(false); // Track if the user has voted

    useEffect(() => {
        axios.get('http://localhost:3001/api/session', { withCredentials: true })
            .then(response => {
                setUserId(response.data.userId);
            })
            .catch(error => {
                console.error('Error fetching user ID:', error);
            });

        socket.on('voteUpdate', (updatedVotes) => {
            setVotes(updatedVotes);
            
        });

        return () => {
            socket.off('voteUpdate');
        };
    }, []);

    const submitVote = async (vote) => {
        if (!userId || hasVoted) {
            console.log('Cannot submit vote.');
            return;
        }
        try {
            await axios.post('http://localhost:3001/api/submitVote', { userId, vote }, { withCredentials: true });
            setHasVoted(true); // Prevent further voting
        } catch (error) {
            console.error('Error submitting vote:', error);
            alert('You have already voted.');
        }
    };

    return (
        <div className="voting">
            <h1>Are you happy?</h1>
            <button disabled={hasVoted} onClick={() => submitVote('yes')}>Yes ({votes.yes})</button>
            <button disabled={hasVoted} onClick={() => submitVote('no')}>No ({votes.no})</button>
        </div>
    );
}

export default Voting;
