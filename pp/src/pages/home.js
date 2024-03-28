import React, {useState} from "react";
import Header from "../components/header";
import Bg from "../components/background";
import './home.css'
import img1 from "../components/img1.png";
import Popup from "../components/popup";
import EnterCode from "../components/enterCode";
import { Link } from "react-router-dom";
import ChallengePage from "./chDetails";


function Home() {
        const [showChPopup, setChPopup] = useState(false);
        const [showJoinPopup, setJoinPopup] = useState(false);
      
        const togglePopup = () => {
          setChPopup(!showChPopup);
        };

        const togglePopup2 = () => {
            setJoinPopup(!showJoinPopup);
          };
    return(
       <div className="bg">
            <div className="hd">
            <h2 className="cName">ZENZONE</h2>
            <Link className="LinkStyle_profile" to = "../checkpoint"><h3 className="profile">PROFILE</h3></Link>
            <h3 className="challenges" onClick={togglePopup}>CHALLENGES</h3>
            <Link to ="../voting"><h3 className="vote">VOTE</h3></Link>
            <Link to ="../community"><h3 className="Community">Community</h3></Link>
        </div>
        <div className="txt">
            <p className="challenge">CHALLENGE</p>
            <p className="yourself">YOURSELF.</p>
            <h3 className="block">JOIN OUR COMMUNITY AND TAKE ON EXCITING NEW CHALLENGES TO PUSH YOURSELF.</h3>
            <Link to="../challenge"><button className="btn1">CREATE A CHALLENGE</button></Link>
            <br />
            <button className="btn2" onClick={togglePopup2}>JOIN A CHALLENGE</button>
            
        </div>
        

 <div className="trying">
    <img src={img1} className="img" alt="lady"/>
    </div>
    {showChPopup && <Popup onClose={togglePopup} />}
    {showJoinPopup && <EnterCode onClose={togglePopup2} />}

       </div>
    )
}

export default Home;