import React, { useState, useEffect } from "react";
import axios from 'axios';
import './community.css';

function Community() {
    const [content, setContent] = useState('');
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetchPosts(); // Fetch posts when the component mounts
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get('http://localhost:3001/fetch-blog-posts', {
                withCredentials: true
            });
            console.log('Fetched posts:', response.data);
            console.log('Number of posts fetched:', response.data.length); // Correctly log the count
            setPosts(response.data); // Update state with fetched posts
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        }
    };
    

    const submitPost = async () => {
        if (!content) {
            alert("Please enter some content before submitting.");
            return;
        }

        try {
            await axios.post('http://localhost:3001/submit-blog-post', { content }, {
                withCredentials: true
            });
            console.log('Post submitted. Refreshing posts...');
            fetchPosts(); // Re-fetch posts to include the new submission
            setContent(''); // Clear the input field after successful submission
        } catch (error) {
            console.error('Failed to submit post:', error);
        }
    };

    return (
        <div className="communityPage">
            <div className="communityPageWhiteBox">
            
            <div className="postsContainer">
                {posts.length > 0 ? posts.map(post => (
                    <div key={post._id} className="post">
                        <h3>{post.username}</h3>
                        <p>{post.content}</p>
                    </div>
                )) : <p>No posts to display.</p>}
            </div>
            <input
                    className="blog"
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write something..."
                />
                <button className="blogbtn" type="button" onClick={submitPost}>SUBMIT POST</button>
            </div>
        </div>
    );
}

export default Community;
