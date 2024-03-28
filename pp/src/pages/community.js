import React, { useState } from "react";
import axios from 'axios';
import './community.css';

function Community() {
    const [content, setContent] = useState('');

    const submitPost = async () => {
        if (!content) {
            alert("Please enter some content before submitting.");
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/submit-blog-post', { content }, {
                withCredentials: true // Ensure cookies are sent with the request
            });
            console.log('Post submitted:', response.data);
            setContent(''); // Clear the input field after successful submission
        } catch (error) {
            console.error('Failed to submit post:', error);
        }
    };

    return (
        <div className="communityPageWhiteBox">
            <input 
                className="blog" 
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write something..."
            />
            <button className="blogbtn" type="button" onClick={submitPost}>SUBMIT POST</button>
        </div>
    );
}

export default Community;
