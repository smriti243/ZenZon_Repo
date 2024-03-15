import React, { useState } from "react";
import './chDetails.css'
import axios from "axios";
import CodePopup from "../components/CodePopup";


function ChallengePage(){

    const [chName, setchName] = useState()
    const [chFormat, setchFormat] = useState()
    const [chDeadline, setchDeadline] = useState()
    const [chStakes, setchStakes] = useState()
    const [chDescription, setchDescription] = useState()
    const [challengeId, setChallengeId] = useState(null)

    const submitChallenge = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3001/challenge',{ chName, chFormat, chDeadline, chStakes, chDescription})
        .then(response => {
            console.log(response.data); // The created challenge, including its ID
            setChallengeId(response.data._id); // Capture the challenge ID
        })
        .catch(err => console.log(err))
    }

    const [showPopup, setShowPopup] = useState(false);
      
        const togglePopup1 = () => {
            if(chName && chFormat && chDeadline && chStakes && chDescription){
                if (chFormat === "Group") {
                    setShowPopup(!showPopup);
                } else {
                    alert("Invite codes can only be generated for group challenges.");
                }
            }
            else{
                alert("Please fill out all fields.");
            }
        };

    return(
        <div className="WhiteBox">
            <h2 className="cName1">ZENZONE</h2>
            <p className="Create">CREATE</p>
            <p className="Challenge">CHALLENGE</p>
            <form className="chDetailsForm" onSubmit={submitChallenge}>
            <input 
                type="text" 
                className="chName" 
                placeholder="Challenge Name"
                onChange={(e)=> setchName(e.target.value)}
             >
            </input>
            <label for = "format"></label>
                <select value={chFormat} name="format" className="chFormat" onChange={(e) => setchFormat(e.target.value)}>
                    <option value="" disabled hidden>Challenge Format</option>
                    <option value="Individual">Individual Challenge</option>
                    <option value="Group">Group Challenge</option>
                </select>
            <input 
                type="date" 
                className="chDeadline" 
                placeholder="Challenge Deadline"
                onChange={(e) => setchDeadline(e.target.value)}>
            </input>
            <label for = "stakes"></label>
                <select name="stakes" className="chStakes" onChange={(e) => setchStakes(e.target.value)}>
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
                onChange={(e)=> setchDescription(e.target.value)}>
            </input>
            <button className="ccBTN">CREATE CHALLENGE</button>
            </form>
            <button className="ifBTN" onClick={togglePopup1}>INVITE FRIENDS</button>
            {showPopup && <CodePopup onClose={togglePopup1} challengeId = {challengeId}/>}
        </div>
    )
}

export default ChallengePage;