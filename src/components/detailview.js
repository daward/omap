import React from 'react';
import '../app.css';

function DetailView({ point }) {
  return (
    <div style={{ color: "white" }}>
      {JSON.stringify(point)}
    </div>
  );
};

export default DetailView;
