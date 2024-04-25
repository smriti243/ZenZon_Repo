import React, { useState, useEffect } from "react";
import axios from "axios";
import './RunningChallengePage.css';
import { useNavigate } from "react-router-dom";

function RunningChallengePage() {
    const navigate = useNavigate();
    const [challenge, setChallenge] = useState({});
    const [checkpoints, setCheckpoints] = useState([]);
    const [selectedFile, setSelectedFile] = useState({});
    const [completionFile, setCompletionFile] = useState(null);
    const [wakaTimeData, setWakaTimeData] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const challengeId = localStorage.getItem('selectedChallengeId');
        if (!challengeId) {
            console.error("No Challenge ID found");
            return;
        }
        axios.get(`http://localhost:3001/api/running-challenge-details/${challengeId}`)
            .then(response => {
                setChallenge(response.data.challenge);
                setCheckpoints(response.data.checkpoints);
                checkWakaTimeConnection();
            })
            .catch(error => {
                console.error("Failed to fetch challenge details:", error);
            });
    }, []);

    const checkWakaTimeConnection = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/check-wakatime-connection', {
                withCredentials: true
            });
            setIsConnected(response.data.isConnected);
            if (response.data.isConnected) {
                fetchWakaTimeData();
            }
        } catch (error) {
            console.error('Failed to check WakaTime connection:', error);
        }
    };

    const fetchWakaTimeData = async () => {
        const challengeId = localStorage.getItem('selectedChallengeId');
        if (!challengeId) {
            console.error("No Challenge ID found");
            return;
        }
        try {
            const response = await axios.get(`http://localhost:3001/wakatime/user-summaries/${challengeId}`, {
                withCredentials: true
            });
            console.log("Raw WakaTime Data:", response.data);
            if (response.data && response.data.length > 0) {
                const formattedData = formatWakaTimeData(response.data);
                setWakaTimeData(formattedData);
            } else {
                throw new Error('No data returned from server');
            }
        } catch (error) {
            console.error('Failed to fetch Wakatime data:', error);
        }
    };
    

    const formatWakaTimeData = (data) => {
        return data.map(day => ({
            date: day.date, // Directly using the date provided in each object
            hours: day.hours, // Directly using the hours provided in each object
            minutes: day.minutes // Directly using the minutes provided in each object
        }));
    };
    

    const handleFileChange = (event, checkpointId) => {
        setSelectedFile({ ...selectedFile, [checkpointId]: event.target.files[0] });
    };

    const handleCompletionFileChange = (event) => {
        setCompletionFile(event.target.files[0]);
    };

    const handleUploadProgress = async (checkpointId) => {
        const file = selectedFile[checkpointId];
        if (!file) {
            alert('No file selected!');
            return;
        }
        const formData = new FormData();
        formData.append('progressImage', file);
        const url = `http://localhost:3001/api/upload-checkpoint-progress?checkpointId=${checkpointId}`;
        try {
            await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Image uploaded successfully!');
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image');
        }
    };

    const handleChallengeComplete = async () => {
        if (!completionFile) {
            alert('No completion file selected!');
            return;
        }
        const formData = new FormData();
        formData.append('completionImage', completionFile);
        const challengeId = localStorage.getItem('selectedChallengeId');
        const url = `http://localhost:3001/api/challenge-complete/${challengeId}`;
        try {
            await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            alert('Completion image uploaded successfully! Your image will be uploaded for the community to vote on.');
            navigate('/home');
        } catch (error) {
            console.error('Error uploading completion image:', error);
            alert('Failed to upload completion image');
        }
    };

    const isChallengeUnderEvaluation = () => {
        return challenge.chCompletionImage !== undefined && challenge.chCompletionImage !== null;
    };

    return (
        <div className="RunningChallengeWhiteBox">
            <h1 className="ChallengeName">{challenge.chName}</h1>
            <div className="ChallengeDetailsBox">
                <p>Description: {challenge.chDescription}</p>
                <p>Deadline: {challenge.chDeadline}</p>
                <p>Format: {challenge.chFormat}</p>
                <p>Stakes: {challenge.chStakes}</p>
                {!isChallengeUnderEvaluation() && (
                    <div>
                        <input type="file" onChange={handleCompletionFileChange} />
                        <button onClick={handleChallengeComplete} className="challengeCompleteBtn">
                            Challenge Complete
                        </button>
                    </div>
                )}
            </div>
            {!isChallengeUnderEvaluation() && (
                <div className="CheckpointsContainer">
                    {checkpoints.map((checkpoint, index) => (
                        <div key={checkpoint._id} className="CheckpointBox" style={{ marginLeft: `${index * 20}px` }}>
                            <p>Checkpoint {index + 1}: {checkpoint.description}</p>
                            <p>Date: {checkpoint.date}</p>
                            <input type="file" onChange={(e) => handleFileChange(e, checkpoint._id)} />
                            <button onClick={() => handleUploadProgress(checkpoint._id)} className="uploadProgressBtn">
                                Upload Progress
                            </button>
                        </div>
                    ))}
                </div>
            )}
            {challenge.chType === 'Technical' && isConnected && wakaTimeData.length > 0 ? (
                <div>
                    <h2>WakaTime Data:</h2>
                    <ul>
                        {wakaTimeData.map((day, index) => (
                            <li key={index}>{`${day.date} : ${day.hours} hours ${day.minutes > 0 ? `${day.minutes} minutes` : ''}`}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <div>No data to display or conditions not met.</div>
            )}
            {isChallengeUnderEvaluation() && (
                <h1 className="challengeUnderEvaluationMsg">Challenge Under Evaluation</h1>
            )}
        </div>
    );
}

export default RunningChallengePage;
