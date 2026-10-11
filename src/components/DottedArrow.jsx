import React from 'react';
import './DottedArrow.css';

const DottedArrow = () => {
  return (
    <div className="dotted-arrow">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <path
          className="dotted-path"
          d="M50,10 C50,50 50,50 50,70"
        />
        <path
          className="arrow-head"
          d="M45,65 L50,75 L55,65"
        />
      </svg>
    </div>
  );
};

export default DottedArrow; 