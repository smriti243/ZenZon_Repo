import React from "react";
import './text.css';
import { Link } from "react-router-dom";
function Text(){
    return(
        <div className="txt">
            <p className="challenge">CHALLENGE</p>
            <p className="yourself">YOURSELF.</p>
            <h3 className="block">JOIN OUR COMMUNITY AND TAKE ON EXCITING NEW CHALLENGES TO PUSH YOURSELF.</h3>
            <button className="btn1">GET STARTED</button>
            <br />
            <button className="btn2">LEARN MORE</button>
            
        </div>
    )
}

export default Text