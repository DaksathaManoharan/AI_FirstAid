import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import MainLayout from './layouts/MainLayout';

// Pages imports
import Home from './pages/Home';
import Copilot from './pages/Copilot';
import SmartGuidePage from './pages/SmartGuidePage';
import EmergencyMapPage from './pages/EmergencyMapPage';
import DisasterPrepPage from './pages/DisasterPrepPage';
import PoisonControl from './pages/PoisonControl';
import SettingsPage from './pages/SettingsPage';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/copilot" element={<Copilot />} />
            <Route path="/smart-guide" element={<SmartGuidePage />} />
            <Route path="/emergency-map" element={<EmergencyMapPage />} />
            <Route path="/disaster-prep" element={<DisasterPrepPage />} />
            <Route path="/poison-control" element={<PoisonControl />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
          </Routes>
        </MainLayout>
      </Router>
    </AppProvider>
  );
}
