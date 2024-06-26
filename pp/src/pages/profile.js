import React, { useState, useEffect } from "react";
import './profile.css';
import axios from 'axios';

function Profile(){

    const [usernameProfilePage, setUsernameProfilePage] = useState("");
    const [emailProfilePage, setEmailProfilePage] = useState("");
    const [passwordProfilePage, setPasswordProfilePage] = useState("");
    const [profilePicture, setProfilePicture] = useState(null); // State to hold profile picture
    const [previewImage, setPreviewImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                const response = await axios.get('http://localhost:3001/api/profilepage', { withCredentials: true });
                console.log('Fetched user details:', response.data);
                setUsernameProfilePage(response.data.username || "");
                setEmailProfilePage(response.data.email || "");
                setPasswordProfilePage(response.data.password || ""); // Note: Including for your specific request
                if (response.data.profilePicture) {
                    setProfilePicture(response.data.profilePicture);
                } else {
                    setProfilePicture(null);
                    setPreviewImage(null);
                }
            } catch (error) {
                console.error("Error fetching user details:", error);
            }
        };
        fetchUserDetails();
    }, []);
    

    const handleUsernameChange = (e) => setUsernameProfilePage(e.target.value);
    const handleEmailChange = (e) => setEmailProfilePage(e.target.value);
    const handlePasswordChange = (e) => setPasswordProfilePage(e.target.value);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);  // This is for uploading
            // Also set a state for previewing the image
            setPreviewImage(URL.createObjectURL(file));
        }
    };
    
    const handleSaveChanges = async () => {
        const formData = new FormData();
        formData.append('username', usernameProfilePage);
        formData.append('email', emailProfilePage);
        // Only append the password if it's actually been changed
        if (passwordProfilePage) formData.append('password', passwordProfilePage);
        if (profilePicture instanceof File) {  // Ensure it's a File object
            formData.append('profilePicture', profilePicture);
        }
        try {
            const response = await axios.put('http://localhost:3001/api/update-userdetails', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true,
            });

            console.log("Server response:", response.data);
            console.log(response.data.message); // "User details updated successfully"
            console.log(`Image URL: http://localhost:3001/uploads/profilePicture/${response.data.user.profilePicture}`);

            if (response.data && response.data.user && response.data.user.profilePicture) {
                console.log('User details updated:', response.data.user);
    
                // Only update the state if the profile picture path is provided in the response
                
                    // const profilePicUrl = response.data.user.profilePicture.includes('http://localhost:3001') ?
                    //                       response.data.user.profilePicture :
                    //                       `http://localhost:3001/${response.data.user.profilePicture.replace(/\\/g, '/')}`;
                    // setProfilePicture(profilePicUrl);

                    setProfilePicture(response.data.user.profilePicture);
            setPreviewImage(null); 

                
                                 }
             else {
                console.error('Invalid response structure:', response.data);
                // Optionally reset or handle the undefined case more gracefully
            }
    

            setIsEditing(false); // Exit editing mode
        } catch (error) {
            console.error("Error updating user details:", error);
        }
    };
    
    const toggleEdit = () => {
        if(isEditing){
            handleSaveChanges();
            setIsEditing(false);
        }
        else{
            setIsEditing(true);
        }
    };

    return(
        <div className="profilePageWhiteBox">
            <div className="profileImageCircle">
                {isEditing ? 
                    <input className="dp" type="file" name="profilePicture" onChange={handleFileChange} /> : 
                    <img className="dp" src={profilePicture||previewImage} alt="Profile" />

                }
            </div>
            <div className="profileField">
                {isEditing ? 
                    <input type="text" className="usernamePP" value={usernameProfilePage} onChange={handleUsernameChange} /> : 
                    <div className="usernamePP">{usernameProfilePage}</div>
                }

                {isEditing ? 
                    <input type="text" className="emailPP" value={emailProfilePage} onChange={handleEmailChange} /> : 
                    <div className="emailPP">{emailProfilePage}</div>
                }

                {isEditing ? 
                    <input type="text" className="passwordPP" value={passwordProfilePage} onChange={handlePasswordChange} /> : 
                    <div className="passwordPP">{"•".repeat(passwordProfilePage.length)}</div>
                }

                <button className="saveOrEditButton" onClick={toggleEdit}>{isEditing ? 'SAVE' : 'EDIT'}</button>
            </div>
        </div>
    );
}

export default Profile;
