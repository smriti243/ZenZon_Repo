import React from "react";
import './profile.css';
import axios from 'axios';
import { useState, useEffect } from "react";

function Profile(){

    const [usernameProfilePage, setUsernameProfilePage] = useState("username");
    const [emailProfilePage, setEmailProfilePage] = useState("email");
    const [passwordProfilePage, setPasswordProfilePage] = useState("password");

    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/profilepage', { withCredentials: true });
                console.log('Fetched user details:', response.data);
                setUsernameProfilePage(response.data.username || "");
                setEmailProfilePage(response.data.email || "");
                setPasswordProfilePage(response.data.password || ""); // Note: Including for your specific request
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        };
        fetchUserDetails();
    }, []);

    const handleUsernameChange = (e)=> setUsernameProfilePage(e.target.value);
    const handleEmailChange = (e)=> setEmailProfilePage(e.target.value);
    const handlePasswordChange = (e)=> setPasswordProfilePage(e.target.value);

    const toggleEdit = () => setIsEditing(!isEditing);



    return(
        <div className="profilePageWhiteBox">
            <div className="profileImageCircle"></div>
            <div className="profileField">
                {isEditing ? ( <input type="text" className="usernamePP" value={usernameProfilePage} onChange={handleUsernameChange}></input>)
                : (<div  className="usernamePP">{usernameProfilePage}</div> )}

                {isEditing ? ( <input type="text" className="emailPP" value={emailProfilePage} onChange={handleEmailChange}></input>)
                : (<div  className="emailPP">{emailProfilePage}</div> )}

                {isEditing ? ( <input type="text" className="passwordPP" value={passwordProfilePage} onChange={handleUsernameChange}></input>)
                : (<div  className="passwordPP">{"•".repeat(passwordProfilePage.length)}</div> )}
             
             <button className="saveOrEditButton" onClick={toggleEdit}>{isEditing ? 'SAVE' : 'EDIT'}</button>

                </div> 
                {/* <div className="profileActions"> */}
                    
                {/* </div> */}
                 

        </div>
    )
}

export default Profile;