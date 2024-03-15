import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';

import Home from '../pages/home';
import ChallengePage from '../pages/chDetails';
import Lobby from '../pages/lobby';
import SignupPage from '../pages/signup'; 
import LoginPage from '../pages/login';
import Profile from '../pages/profile';
import Bg from './background';

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
            </Routes>
        </AuthProvider>
        
    </div>);
}

export default App;
