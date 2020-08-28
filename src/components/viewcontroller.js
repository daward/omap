import React from 'react';
import { Button } from "semantic-ui-react";
import '../app.css';

function ViewController({ 
  showDeltaSilt, 
  showRivers, 
  autoAge, 
  hardness, 
  onViewChange, 
  age, 
  raise,
  harden,
  soften }) {
  return (
    <div>
      <Button toggle
        active={showDeltaSilt}
        onClick={() => onViewChange({ showDeltaSilt: !showDeltaSilt })}> Show Delta Silt</Button >

      <Button toggle
        active={showRivers}
        onClick={() => onViewChange({ showRivers: !showRivers })}> Show Rivers</Button >

      <Button onClick={() => age()}>Age</Button>
      <Button toggle active={autoAge} onClick={() => {
        onViewChange({ autoAge: !autoAge });
        age();
      }}>autoAge</Button>
      <Button onClick={() => raise()}>Orogeny</Button>
      <Button onClick={() => onViewChange({ hardness: !hardness })}>View Hardness</Button>
      <Button onClick={() => harden()}>Harden</Button>
      <Button onClick={() => soften()}>Soften</Button>
    </div>
  );
};

export default ViewController;
