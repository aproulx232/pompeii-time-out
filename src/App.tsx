import React from 'react';
import './App.css';
import Game from './components/game/Game';

function App() {
  return (
    <div className="App">
      <header className="game-header">
        <h1>Pompeii Time Out</h1>
        <p className="game-tagline">Connect through time. Save ancient Pompeii.</p>
      </header>
      <Game />
    </div>
  );
}

export default App;
