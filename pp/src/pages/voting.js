import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import './voting.css';

const socket = io("http://localhost:3001", { 
    path: '/socket.io', 
    transports: ["websocket", "polling"] });

function Voting() {
    const [userId, setUserId] = useState(null);
    const [images, setImages] = useState([]); // Store images from the server
    const [votedImages, setVotedImages] = useState({}); // Object to track votes per image

    useEffect(() => {
        axios.get('http://localhost:3001/api/session', { withCredentials: true })
            .then(response => {
                setUserId(response.data.userId);
            })
            .catch(error => console.error('Error fetching user ID:', error));

        axios.get('http://localhost:3001/api/challenge-completion-images', { withCredentials: true })
            .then(response => {
                // Initialize votes if not present
                const imagesWithVotes = response.data.map(image => ({
                    ...image,
                    votes: image.votes || { yes: 0, no: 0 }
                }));
                setImages(imagesWithVotes);
            })
            .catch(error => console.error('Error fetching images:', error));
            socket.on('voteUpdate', (updatedVote) => {
                setImages(currentImages => currentImages.map(img => 
                    img._id === updatedVote.imageId ? { ...img, votes: updatedVote.votes } : img
                ));
            });
            

        return () => {
            socket.off('voteUpdate');
        };
    }, []);

    const submitVote = async (imageId, vote) => {
        if (!userId || votedImages[imageId]) {
            console.log('Cannot submit vote or already voted for this image.');
            return;
        }
        try {
            await axios.post('http://localhost:3001/api/submitVote', { userId, vote, imageId }, { withCredentials: true });
            setVotedImages(prev => ({ ...prev, [imageId]: true })); // Mark this image as voted
        } catch (error) {
            console.error('Error submitting vote:', error);
            alert('Failed to submit vote.');
        }
    };
    

    return (
        <div className="voting">
            <h1>Vote on these images</h1>
            {images.map(image => (
    <div key={image._id} className="image-voting">
        <img className='VotingImages' src={`http://localhost:3001/${image.chCompletionImage}`} alt="Completion" />
        <div className="voting-buttons">
            <button disabled={!!votedImages[image._id]} onClick={() => submitVote(image._id, 'yes')}>
                Yes ({image.votes ? image.votes.yes : 0})
            </button>
            <button disabled={!!votedImages[image._id]} onClick={() => submitVote(image._id, 'no')}>
                No ({image.votes ? image.votes.no : 0})
            </button>
        </div>
    </div>
))}

        </div>
    );
}

export default Voting;
