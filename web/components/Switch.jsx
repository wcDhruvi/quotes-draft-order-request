import React from 'react';
import './Switch.css';

const Switch = ({ checked, onChange, label }) => {
  return (
    <div className="switch-wrapper">
      {label && <span className="switch-label">{label}</span>}
      <label className="switch">
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)} 
        />
        <span className="slider round"></span>
      </label>
    </div>
  );
};

export default Switch;
