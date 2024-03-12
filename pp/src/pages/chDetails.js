import React from "react";
import './chDetails.css'

function ChallengePage(){
    

    return(
        <div className="WhiteBox">
            <h2 className="cName1">ZENZONE</h2>
            <p className="Create">CREATE</p>
            <p className="Challenge">CHALLENGE</p>
            <input type="text" className="chName" placeholder="Challenge Name"></input>
            <input type="date" className="chFormat" placeholder="Challenge Format"></input>
            <input type="text" className="chDeadline" placeholder="Challenge Deadline"></input>
            <input type="text" className="chStakes" placeholder="Challenge Stakes"></input>
            <input type="text" className="chDescription" placeholder="Challenge Description"></input>
            <button className="ccBTN">CREATE CHALLENGE</button>
            <button className="ifBTN">INVITE FRIENDS</button>
        </div>
    )
}

export default ChallengePage;