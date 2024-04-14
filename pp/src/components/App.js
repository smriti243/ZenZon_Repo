import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

import Home from '../pages/home';
import Voting from '../pages/voting';
import Community from '../pages/community';
import ChallengePage from '../pages/chDetails';
import Lobby from '../pages/lobby';
import Checkpoint from '../pages/checkpoint';
import SignupPage from '../pages/signup'; 
import LoginPage from '../pages/login';
import Profile from '../pages/profile';
import Bg from './background';
import ImageStake from '../pages/imageStake';
import RunningChallengePage from '../pages/RunningChallengePage';
import WallOfShame from "../pages/wallOfShame"

function App() {
    return (<div>
        <AuthProvider>
            <Routes>
             <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
             <Route path='/' element = {<Bg />} />
             <Route path="/challenge" element={<ProtectedRoute><ChallengePage /></ProtectedRoute>} />
             <Route path="/lobby" element={<ProtectedRoute><Lobby /></ProtectedRoute>} />
             <Route path="/signup" element={<SignupPage />} />
             <Route path="/login" element={<LoginPage />} />
             <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
             <Route path="/checkpoint" element={<ProtectedRoute><Checkpoint /></ProtectedRoute>} />
             <Route path="/voting" element={<ProtectedRoute><Voting /></ProtectedRoute>} />
             <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
             <Route path="/imageStake" element={<ProtectedRoute><ImageStake /></ProtectedRoute>} />
             <Route path="/RunningChallengePage" element={<ProtectedRoute><RunningChallengePage /></ProtectedRoute>} />
             <Route path="/WallOfShame" element={<ProtectedRoute><WallOfShame /></ProtectedRoute>} />
            </Routes>
        </AuthProvider>
        
    </div>);
}

export default App;
