import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './components/HomePage';
import CaptureNotes from './components/CaptureNotes';
import ExistingResearch from './components/ExistingResearch';
import './styles/designTokens.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CaptureNotes />} />
          <Route path="/research/:id" element={<ExistingResearch />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
