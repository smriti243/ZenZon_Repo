import React from "react";
import './lobby.css';

function Lobby(){
    return(
        <div className="WhiteBox">
            <p className="cName1">ZENZONE</p>
            <h1 className="Your">YOUR</h1>
            <h1 className="Lobby">LOBBY</h1>
            <div className="lobby1">
                <div className="circle1"></div>
            </div>
            <div className="lobby2">
            <div className="circle1"></div>
            </div>
            <div className="lobby3">
            <div className="circle1"></div>
            </div>
        </div>
    )
}

export default Lobby;