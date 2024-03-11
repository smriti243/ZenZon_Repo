// Popup.js
import React from 'react';
import './popup.css';

function Popup({ onClose }) {
  return (
    <div className="popup">
      <div className="popup-inner">
        <h3 className='heading'>RUNNING CHALLENGES</h3>
        <p className="ch1">Challenge 1</p>
        <p className="ch2">Challenge 2</p>
        <button className="popupbtn" onClick={onClose}>CLOSE</button>
      </div>
    </div>
  );
}

export default Popup;
