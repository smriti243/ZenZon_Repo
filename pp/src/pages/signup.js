import React from "react";
import { Link } from "react-router-dom";
import './signup.css';
import axios from 'axios'
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import img from '../assests/WhatsApp Image 2024-03-04 at 11.14.21_67e52370.jpg'

function SignupPage(){
    const [name, setName] = useState()
    const [username, setUsername] = useState()
    const [email, setEmail] = useState()
    const [password, setPassword] = useState()
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        axios.post('http://localhost:3001/signup',{name, username, email, password})
        .then(result => {console.log(result)
        navigate('/login')
        })
        .catch(err => console.log(err))
    }

    return(
        <div className="smallbox">
            <img src={img} className="sideimg"></img>
            <p className="cName2">ZENZONE</p>
            <h1 className="sign">SIGN</h1>
            <h1 className="up">UP</h1>
          <form className="irritatingForm" onSubmit={handleSubmit}>
            <input
            type="text"
            className="flName"
            placeholder="Full Name"
            onChange={(e) => setName(e.target.value)}
            >
            </input>
            <input
            type="text"
            className="uName"
            placeholder="Username"
            onChange={(e) => setUsername(e.target.value)}
            >
            </input>
            <input
            type="email"
            className="uEmail"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            >
            </input>
            <input
            type="password"
            className="uPassword"
            placeholder="Password"
            onChange={(e)=> setPassword(e.target.value)}
            >
            </input>
            <button type="submit" className="submitbtn">SIGNUP</button>
            </form>
            <Link to='../login' className="LinkStyle_loginbtn_form"><button className="linkbtn">LOGIN</button></Link>
            
        </div>
        
    )
}

export default SignupPage;