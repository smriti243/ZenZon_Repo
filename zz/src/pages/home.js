import React, {useState} from "react";
import Header from "../components/header";
import Bg from "../components/background";

import img1 from "../components/img1.png";
import Popup from "../components/popup";
import { Link } from "react-router-dom";
import ChallengePage from "./chDetails";


function Home() {
        const [showPopup, setShowPopup] = useState(false);
      
        const togglePopup = () => {
          setShowPopup(!showPopup);
        };
    return(
       <div className="bg">
            <div className="hd">
            <h2 className="cName">ZENZONE</h2>
            <h3 className="login">SHAME</h3>
            <h3 className="signup" onClick={togglePopup}>CHALLENGES</h3>
        </div>
        <div className="txt">
            <p className="challenge">CHALLENGE</p>
            <p className="yourself">YOURSELF.</p>
            <h3 className="block">JOIN OUR COMMUNITY AND TAKE ON EXCITING NEW CHALLENGES TO PUSH YOURSELF.</h3>
            <Link to="../challenge"><button className="btn1">CREATE A CHALLENGE</button></Link>
            <br />
            <button className="btn2">JOIN A CHALLENGE</button>
            
        </div>
        

 <div className="trying">
    <img src={img1} className="img" alt="lady"/>
    </div>
    {showPopup && <Popup onClose={togglePopup} />}

       </div>
    )
}

export default Home;