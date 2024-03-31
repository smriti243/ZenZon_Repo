import React, { useState } from 'react';
import './checkpoint.css';
import axios from "axios"

function Checkpoint() {
  const challengeId = localStorage.getItem('currentChallengeId');
  const [checkpoints, setCheckpoints] = useState([1]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [checkpointData, setCheckpointData] = useState({ description: "", date: "" });

  const addMoreCheckpoints = () => {
    if (checkpoints.length < 5) {
      setCheckpoints(prevCheckpoints => [...prevCheckpoints, prevCheckpoints.length + 1]);
    } else {
      alert('You have reached the maximum number of checkpoints');
    }
  };

  const removeLastCheckpoint = () => {
    setCheckpoints(prevCheckpoints => prevCheckpoints.slice(0, -1));
  };

  const showInput = (index) => {
    setSelectedCheckpoint(index);
    setCheckpointData({ description: "", date: "" });
  };

  const handleDescriptionChange = (e) => {
    setCheckpointData({ ...checkpointData, description: e.target.value });
  };

  const handleDateChange = (e) => {
    setCheckpointData({ ...checkpointData, date: e.target.value });
  };

  const submitCheckpointData = async () => {
    if (!checkpointData.description || !checkpointData.date) {
      alert('Please fill in all fields');
      return;
    }

    const dataToSend = {
      number: selectedCheckpoint + 1, // Assuming checkpoint number is 1-indexed
      description: checkpointData.description,
      date: checkpointData.date,
      challengeId, // Assuming you have challengeId stored correctly
    };

    try {
      await axios.post('http://localhost:3001/api/checkpoint', dataToSend);
      alert('Checkpoint submitted successfully');
      // Reset fields after successful submission
      setSelectedCheckpoint(null);
      setCheckpointData({ description: "", date: "" });
    } catch (error) {
      console.error('Error submitting checkpoint:', error);
      alert('Failed to submit checkpoint');
    }
  };
  
  return (
    <div className="checkpointWhiteBox">
      <h1 className="check">CHECK</h1>
      <h1 className="point">POINTS</h1>
     <div className="checkpointbg">
     {checkpoints.map((checkpoint, index) => (
        <React.Fragment key={index}>
          <div
            className="checkpoint"
            style={{
              gridRowStart: `${1 + index}`,
              gridColumnStart: "1",
              gridColumnEnd: "2"
            }}
            onClick={() => showInput(index)}
          >
            {checkpoint}
          </div>
          {selectedCheckpoint === index && (
            <>
              <input
                type="text"
                className="inputDescription"
                placeholder="Enter description"
                value={checkpointData.description} 
                onChange={handleDescriptionChange}
                style={{
                  gridRowStart: `${1 + index}`,
                  gridColumnStart: "2",
                  gridColumnEnd: "3",
                }}
              />
              <input
                type="date"
                className="inputDate"
                value={checkpointData.date}
                onChange={handleDateChange}
                style={{
                  gridRowStart: `${1 + index}`,
                  gridColumnStart: "3",
                  gridColumnEnd: "4",
                }}
              />
              <button
                className="submitDescription"
                onClick={submitCheckpointData}
                style={{
                  gridRowStart: `${1 + index}`,
                  gridColumnStart: "4",
                  gridColumnEnd: "5",
                }}
              >
                Submit
              </button>
            </>
          )}
        </React.Fragment>
      ))}
     </div>
      <button className="addmore" onClick={addMoreCheckpoints}>+</button>
      {checkpoints.length > 1 && <button className="subtract" onClick={removeLastCheckpoint}>-</button>}
    </div>
  );
}

export default Checkpoint;
