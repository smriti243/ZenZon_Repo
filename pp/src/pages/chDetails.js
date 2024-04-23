import React, { useState } from "react";
import './chDetails.css'
import axios from "axios";
import { useNavigate } from "react-router-dom"; 
import io from 'socket.io-client';

const socket = io('http://localhost:3001', { withCredentials: true });

axios.defaults.withCredentials = true;

function ChallengePage(){

const [chName, setChName] = useState(); 
const [chType, setChType] = useState();
const [chFormat, setChFormat] = useState();
const [chDeadline, setChDeadline] = useState();
const [chStakes, setChStakes] = useState();
const [chDescription, setChDescription] = useState();
const navigate = useNavigate();

const today = new Date().toISOString().split('T')[0];

let challengeSubmit= (e)=>{
    e.preventDefault();
   try{
    if (chName && chType && chFormat && chDeadline && chStakes && chDescription ){
        console.log(chName, chType, chFormat,chDeadline, chStakes, chDescription)
        if (chFormat === "Individual"){
         axios.post("http://localhost:3001/challenge", {chName, chType, chFormat, chDeadline, chStakes, chDescription})
         .then(response => { console.log(response)
         // Assuming the server response includes the challengeId
         const challengeId = response.data.challengeId;
         // Store the challengeId in local storage
         localStorage.setItem('currentChallengeId', challengeId);
         })
         .catch(err => {console.log(err)})
         navigate('/checkpoint')
        }
        else {
         alert("Press Invite Friends for group challenges")
        }
     }
      else{
        alert("Please fill out all fields.")
    }
   }
   catch(err){
    console.log(err)
   }
    // else{
    //     alert("Please fill out all fields.")
    // }
}

let handleInviteFriends = (e) => {
    e.preventDefault();
    if (chName && chType && chFormat && chDeadline && chStakes && chDescription) {
        if (chFormat === "Group") {
            axios.post("http://localhost:3001/challenge", {
                chName,
                chType,
                chFormat,
                chDeadline,
                chStakes,
                chDescription,
                generateInviteCode: true
            })
            .then(async (response) => {
                alert("Invite Code : " + response.data.inviteCode);
                const challengeId = response.data.challengeId;
                // Store the challengeId in local storage
                localStorage.setItem('currentChallengeId', challengeId);
                try {
                    // Join the lobby using WebSockets
                    const socket = io('http://localhost:3001', { withCredentials: true });
                    socket.emit('joinRoom', { challengeId });
                    // Navigate to the lobby after successfully joining
                    navigate('../lobby');
                } catch (error) {
                    console.error('Error joining lobby:', error);
                    // Handle error joining lobby, if needed
                }
            })
            .catch((err) => {
                console.log(err);
                alert("Failed to create the challenge.");
            });
        } else {
            alert("Invite codes can only be generated for group challenges.");
        }
    } else {
        alert("Please fill out all fields.");
    }
};


    return(
        <div className="WhiteBox">
            <h2 className="cName1">ZENZONE</h2>
            <p className="Create">CREATE</p>
            <p className="Challenge">CHALLENGE</p>
            <form className="chDetailsForm" onSubmit={challengeSubmit} >
            <input 
                type="text" 
                className="chName" 
                placeholder="Challenge Name"
                onChange={(e)=> setChName(e.target.value)}
             > 
            </input>
            <label for = "format"></label>
                <select name="format" className="chType" onChange={(e)=> setChType(e.target.value)}>
                    <option value="" disabled hidden selected>Challenge Type</option>
                    <option value="Physical">Physical Challenge</option>
                    <option value="Technical">Technical Challenge</option>
                </select>
            <label for = "format"></label>
                <select name="format" className="chFormat" onChange={(e)=> setChFormat(e.target.value)}>
                    <option value="" disabled hidden selected>Challenge Format</option>
                    <option value="Individual">Individual Challenge</option>
                    <option value="Group">Group Challenge</option>
                </select>
            <input 
                type="date" 
                className="chDeadline" 
                min={today} 
                placeholder="Challenge Deadline"
                onChange={(e)=> setChDeadline(e.target.value)}
                >
            </input>
            <label for = "stakes"></label>
                <select name="stakes" className="chStakes" onChange={(e)=>setChStakes(e.target.value)}>
                    <option value="stakes" disabled selected hidden>Challenge Stakes</option>
                    <option value="image">Image</option>
                    <option value="money">Money</option>
                </select>
            {/* <input 
                type="text" 
                className="chStakes" 
                placeholder="Challenge Stakes">
            </input> */}
            <input 
                type="text" 
                className="chDescription" 
                placeholder="Challenge Description"
                onChange={(e)=> setChDescription(e.target.value)}
                >
            </input>
            <button className="ccBTN">CREATE CHALLENGE</button>
            </form>
            <button className="ifBTN" onClick={handleInviteFriends}>INVITE FRIENDS</button>
            

        </div>
    )
}

export default ChallengePage;