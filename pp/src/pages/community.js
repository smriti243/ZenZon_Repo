import React, { useState, useEffect } from "react";
import axios from 'axios';
import io from 'socket.io-client';
import './community.css';

const socket = io("http://localhost:3001", { withCredentials: true });

function Community() {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        fetchPosts();
        socket.on('newBlogPost', (data) => {
            console.log(data.message); 
            console.log('New blog post detected. Fetching latest posts...');
            fetchPosts(); // Fetch latest posts whenever a new post is submitted
        });

        // Cleanup on component unmount
        return () => socket.off('newBlogPost');
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get('http://localhost:3001/fetch-blog-posts', {
                withCredentials: true
            });
            console.log('Fetched posts:', response.data);
            console.log('Number of posts fetched:', response.data.length); // Correctly log the count
            // const reversedPosts = response.data.reverse();
            setPosts(response.data); // Update state with fetched posts
        } catch (error) {
            console.error('Failed to fetch posts:', error);
        }
    };
    

    const submitPost = async () => {
        if (!content && !image) {
            alert("Please enter some content or select an image before submitting.");
            return;
        }
    
        const formData = new FormData();
        formData.append('content', content);
        if (image) {
            formData.append('image', image); // Make sure 'image' is being appended correctly
        }
    
        try {
            const response = await axios.post('http://localhost:3001/submit-blog-post', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            console.log('Post submitted:', response.data);
            fetchPosts(); // Re-fetch posts to include the new submission
            setContent(''); // Clear the content input field after successful submission
            setImage(null); // Clear the image input field after successful submission
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
                        {post.image && <img className="blogImages" src={`${post.image}?${new Date().getTime()}`} alt="Post" />}
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
                  <input type="file" onChange={(e) => {
    console.log(e.target.files[0]); // This will show you the file object
    setImage(e.target.files[0]);
}} accept="image/*" />

                <button className="blogbtn" type="button" onClick={submitPost}>SUBMIT POST</button>
            </div>
        </div>
    );
}

export default Community;
