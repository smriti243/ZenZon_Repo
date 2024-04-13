import React,{ useState } from "react";
import './imageStake.css';
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function ImageStake() {
    const [file, setFile] = useState(null);
    const navigate = useNavigate();
    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleFinish = () => {
      
        navigate('/home');
       
      };
    

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('stakeImage', file);
        formData.append('challengeId', localStorage.getItem('currentChallengeId'));
        console.log('Sending challengeId:', localStorage.getItem('currentChallengeId'));
        for (let [key, value] of formData.entries()) {
            console.log(key, value);
          }
          

        try {
            const response = await axios.post('http://localhost:3001/api/stake-image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
    
            alert('Image and details submitted successfully!');
            console.log('Challenge updated:', response.data);
        } catch (error) {
            console.error('Error updating challenge:', error);
        }
    };


    return(
        <div className="checkpointWhiteBox">
             <h1 className="check">IMAGE</h1>
            <h1 className="point">UPLOAD</h1>
            <input className="stakeImage" type="file" onChange={handleFileChange} name="stakeImage"></input>
            <button className="imageSubmitBtn"  onClick={handleSubmit}>SUBMIT</button>
            <button className="FinishBtn"  onClick={handleFinish}>FINISH</button>
        </div>
    );
}

export default ImageStake; 