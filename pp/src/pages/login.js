import React from 'react';
import img from '../assests/WhatsApp Image 2024-03-04 at 11.14.21_67e52370.jpg'
import { Link } from'react-router-dom';
import './login.css';
import axios from 'axios'
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LoginPage(){

    const navigate = useNavigate();
    const [email, setEmail] = useState();
    const [password, setPassword] = useState();

    const handleSubmit = (e) => {
        e.preventDefault()
        axios.post('http://localhost:3001/login',{email, password})
        .then(result => {console.log(result)
            if (result.data === "Success"){
                navigate('/home')
            }
        
        })
        .catch(err => console.log(err))
    }

    return(
        <div className="smallbox">
            <img src={img} className="sideimg"></img>
            <p className="cName2">ZENZONE</p>
            <h1 className="sign">LOG</h1>
            <h1 className="up">IN</h1>
          <form className="irritatingForm" onSubmit={handleSubmit}>
            {/* <input
            type="text"
            className="flName"
            placeholder="Full Name"
            >
            </input>
            <input
            type="text"
            className="uName"
            placeholder="Username"
            >
            </input> */}
            <input
            type="email"
            className="uEmail"
            placeholder="Email"
            autoComplete="off"
            onChange={(e) => setEmail(e.target.value)}
            >
            </input>
            <input
            type="password"
            className="uPassword"
            placeholder="Password"
            autoComplete="off"
            onChange={(e) => setPassword(e.target.value)}
            >
            </input>
            <button type="submit" className="submitbtn1">LOGIN</button>
            </form>
           <Link to='../signup' className='LinkStyle_signupbtn_form'><button className="linkbtn">SIGNUP</button></Link> 
            
        </div>
    )
}

export default LoginPage;