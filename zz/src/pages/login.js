import React from 'react';
import img from '../assests/WhatsApp Image 2024-03-04 at 11.14.21_67e52370.jpg'
import { Link } from'react-router-dom';
import './login.css';

function LoginPage(){
    return(
        <div className="smallbox">
            <img src={img} className="sideimg"></img>
            <p className="cName2">ZENZONE</p>
            <h1 className="sign">LOG</h1>
            <h1 className="up">IN</h1>
          <form className="irritatingForm">
           
            <input
            type="email"
            className="uEmail"
            placeholder="Email"
            autoComplete="off"
            >
            </input>
            <input
            type="password"
            className="uPassword"
            placeholder="Password"
            autoComplete="off"
            >
            </input>
            <button type="submit" className="submitbtn1">LOGIN</button>
            </form>
            <button className="linkbtn">SIGNUP</button>
            
        </div>
    )
}

export default LoginPage;