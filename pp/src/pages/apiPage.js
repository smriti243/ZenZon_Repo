import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import './apiPage.css';
import axios from 'axios'; // Note: axios is imported but not used in this code.

function ApiPage() {
    const [isConnected, setIsConnected] = useState(false);
    const [dashboard, setDashboard] = useState(''); // State to store dashboard data

    useEffect(() => {
        const checkConnectionStatus = async () => {
            try {
                const response = await fetch('http://localhost:3001/api/check-wakatime-connection', {
                    credentials: 'include' // to include cookies in the request
                });
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                setIsConnected(data.isConnected);
            } catch (error) {
                console.error('Failed to check connection status', error);
            }
        };

        checkConnectionStatus();
    }, []);

    useEffect(() => {
        const fetchWakaTimeData = async () => {
            if (isConnected) {
                try {
                    const response = await fetch("http://localhost:3001/wakatime/user-summaries", {
                        credentials: 'include'
                    });
                    if (!response.ok) {
                        if (response.status === 403) {
                            throw new Error("Missing necessary permissions. Please reconnect with the correct permissions.");
                        }
                        throw new Error('Failed to fetch Wakatime summaries');
                    }
                    const data = await response.json();
                    setDashboard(JSON.stringify(data, null, 2)); // Assuming the data is JSON and you want to display it as a string
                } catch (error) {
                    console.error('Failed to fetch Wakatime data', error);
                    setDashboard(`Error: ${error.message}`);
                }
            }
        };
    
        fetchWakaTimeData();
    }, [isConnected]); // This effect depends on isConnected
    

    const handleAuthorize = () => {
        window.location.href = 'http://localhost:3001/wakatime/authorize';
    };

    return (
        <div className='WhiteBox'>
            <h1 className='integrate'>INTEGRATE</h1>
            <h1 className='wakatime'>WAKATIME</h1>
            {isConnected ? (
                <div className='msgbox'>
                    <h2 className='apimsg1'>Connected to WakaTime!</h2>
                    <h2 className='apimsg2'>Click on this link to get your own API key</h2>
                    <div className='linktoAPIkeybox'>
                        <p className='linkToAPIkey'>
                            <Link className='Linkstyle_linkToAPIkey' to='https://wakatime.com/api-key'>Wakatime API Key Page</Link>
                        </p>
                        <pre>{dashboard}</pre> {/* Display the dashboard data in a preformatted text element */}
                    </div>
                </div>
            ) : (
                <button className='apibtn' onClick={handleAuthorize}>Connect to WakaTime</button>
            )}
        </div>
    );
}

export default ApiPage;
