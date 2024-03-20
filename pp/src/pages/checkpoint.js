import React, { useState } from 'react';
import './checkpoint.css';

function Checkpoint() {
  const [checkpoints, setCheckpoints] = useState([1]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);

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
                style={{
                  gridRowStart: `${1 + index}`,
                  gridColumnStart: "2",
                  gridColumnEnd: "3",
                }}
              />
              <input
                type="date"
                className="inputDate"
                style={{
                  gridRowStart: `${1 + index}`,
                  gridColumnStart: "3",
                  gridColumnEnd: "4",
                }}
              />
              <button
                className="submitDescription"
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
