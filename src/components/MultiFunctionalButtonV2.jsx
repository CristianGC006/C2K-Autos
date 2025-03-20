import React from 'react';
import '../index.css';
const MultiFunctionalButtonV2 = ({ type, label, icon }) => {
  return (
    <div className="multi-functional-button">
      <div className="icon">{icon}</div>
      <div className="label">{label}</div>
      {type === 'date' && <input type="date" />}
      {type === 'time' && <input type="time" />}    
    </div>
  );
};

export default MultiFunctionalButtonV2;