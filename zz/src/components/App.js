import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Home from '../pages/home';
import ChallengePage from '../pages/chDetails';
import Lobby from '../pages/lobby';
import SignupPage from '../pages/signup';
import LoginPage from '../pages/login';

import Bg from './background';

function App() {
    return (<div>
          <Routes>
    <Route path="/home" element={<Home />} />
         <Route path='/' element = {<Bg />} />
             <Route path="/challenge" element={<ChallengePage />} />
              <Route path="/lobby" element={<Lobby />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            </Routes>
        
    </div>);
}

export default App;
