import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import zxcvbn from 'zxcvbn';

import img from '../assests/WhatsApp Image 2024-03-04 at 11.14.21_67e52370.jpg';
import './signup.css';

function SignupPage() {
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();

    const handlePasswordChange = (e) => {
        const passwordInput = e.target.value;
        setPassword(passwordInput);
        const evaluation = zxcvbn(passwordInput);
        setPasswordStrength(evaluation.score);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post('http://localhost:3001/signup', { name, username, email, password })
            .then(result => {
                console.log(result);
                navigate('/login');
            })
            .catch(err => console.log(err));
    };

    const renderPasswordStrengthIndicator = () => {
        const strengthLevels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
        const strengthLevel = strengthLevels[passwordStrength];
        return <div className={`password-strength strength-${strengthLevel.toLowerCase()}`}>{strengthLevel}</div>;
    };

    return (
        <div className="smallbox">
            <img src={img} className="sideimg" alt="side"/>
            <p className="cName2">ZENZONE</p>
            <h1 className="sign">SIGN</h1>
            <h1 className="up">UP</h1>
            <form className="irritatingForm" onSubmit={handleSubmit}>
                <input type="text" className="flName" placeholder="Full Name" onChange={(e) => setName(e.target.value)} />
                <input type="text" className="uName" placeholder="Username" onChange={(e) => setUsername(e.target.value)} />
                <input type="email" className="uEmail" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
                <input type="password" className="uPassword" placeholder="Password" onChange={handlePasswordChange} />
                {renderPasswordStrengthIndicator()}
                <button type="submit" className="submitbtn">SIGNUP</button>
            </form>
            <Link to="../login" className="LinkStyle_loginbtn_form"><button className="linkbtn">LOGIN</button></Link>
        </div>
    );
}

export default SignupPage;
