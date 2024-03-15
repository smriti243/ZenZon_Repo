import React, { useEffect, useState } from 'react';
import './CodePopup.css';

function CodePopup({ onClose, challengeId }) {
    const [code, setCode] = useState('');
    

    useEffect(() => {
        handleGenerateCode();
    }, []); // This effect runs once on component mount

    const handleGenerateCode = () => {
        const newCode = generateCode();
        setCode(newCode);
    };

    function generateCode(length = 6) {
        let result = '';
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }

    return (
        <div className="popup">
            <div className="popup-inner">
                <h3 className='heading'>INVITE CODE</h3>
                <p className="ch1" > {code}</p> {/* Display the generated code */}
                <button className="popupbtn" onClick={onClose}>CLOSE</button>
            </div>
        </div>
    );
}

export default CodePopup;
