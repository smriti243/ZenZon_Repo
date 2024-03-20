import React, { useState } from "react";
import './chDetails.css'
import axios from "axios";
import { useNavigate } from "react-router-dom"; 

axios.defaults.withCredentials = true;

function ChallengePage(){

const [chName, setChName] = useState(); 
const [chFormat, setChFormat] = useState();
const [chDeadline, setChDeadline] = useState();
const [chStakes, setChStakes] = useState();
const [chDescription, setChDescription] = useState();
const navigate = useNavigate();

let challengeSubmit= (e)=>{
    e.preventDefault();
    if (chName &&  chFormat && chDeadline && chStakes && chDescription ){
       if (chFormat === "Individual"){
        axios.post("http://localhost:3001/challenge", {chName, chFormat, chDeadline, chStakes, chDescription})
        .then(response => { console.log(response)})
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

let handleInviteFriends=(e)=>{
    e.preventDefault();
    if (chName && chFormat && chDeadline && chStakes && chDescription){
        if (chFormat === "Group"){
            axios.post("http://localhost:3001/challenge", {chName, chFormat, chDeadline, chStakes, chDescription, generateInviteCode: true})
            .then(response => { alert("Invite Code : " + response.data.inviteCode)})
            .catch (err => {console.log(err)})
           
            navigate('../lobby')
        }
        else{
            alert("Invite codes can only be generated for group challenges.")
        }
    }
    else{
        alert("Please fill out all fields.")
    }
}

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
                <select name="format" className="chFormat" onChange={(e)=> setChFormat(e.target.value)}>
                    <option value="" disabled hidden selected>Challenge Format</option>
                    <option value="Individual">Individual Challenge</option>
                    <option value="Group">Group Challenge</option>
                </select>
            <input 
                type="date" 
                className="chDeadline" 
                placeholder="Challenge Deadline"
                onChange={(e)=> setChDeadline(e.target.value)}
                >
            </input>
            <label for = "stakes"></label>
                <select name="stakes" className="chStakes" onChange={(e)=>setChStakes(e.target.value)}>
                    <option value="stakes" disabled selected hidden>Challenge Stakes</option>
                    <option value="image">Image</option>
                    <option value="money">Money</option>
                    <option value="dare">Dare</option>
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