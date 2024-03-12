import React, { useState } from "react";
import './chDetails.css'

function ChallengePage(){

    const [chName, setchName] = useState()

    return(
        <div className="WhiteBox">
            <h2 className="cName1">ZENZONE</h2>
            <p className="Create">CREATE</p>
            <p className="Challenge">CHALLENGE</p>
            <input 
                type="text" 
                className="chName" 
                placeholder="Challenge Name"
             >
            </input>
            <label for = "format"></label>
                <select name="format" className="chFormat">
                    <option value="" disabled selected hidden>Challenge Format</option>
                    <option value="Individual">Individual Challenge</option>
                    <option value="Group">Group Challenge</option>
                </select>
            <input 
                type="date" 
                className="chDeadline" 
                placeholder="Challenge Deadline">
            </input>
            <label for = "stakes"></label>
                <select name="stakes" className="chStakes">
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
                placeholder="Challenge Description">
            </input>
            <button className="ccBTN">CREATE CHALLENGE</button>
            <button className="ifBTN">INVITE FRIENDS</button>
        </div>
    )
}

export default ChallengePage;