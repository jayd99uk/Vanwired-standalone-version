import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import CableConverter from "./CableConverter";

import OhmsLaw from "./OhmsLaw";

import SolarBattery from "./SolarBattery";

import Resources from "./Resources";

import Checklists from "./Checklists";

import CableSystem from "./CableSystem";

import WattsTriangle from "./WattsTriangle";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    CableConverter: CableConverter,
    
    OhmsLaw: OhmsLaw,
    
    SolarBattery: SolarBattery,
    
    Resources: Resources,
    
    Checklists: Checklists,
    
    CableSystem: CableSystem,
    
    WattsTriangle: WattsTriangle,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/CableConverter" element={<CableConverter />} />
                
                <Route path="/OhmsLaw" element={<OhmsLaw />} />
                
                <Route path="/SolarBattery" element={<SolarBattery />} />
                
                <Route path="/Resources" element={<Resources />} />
                
                <Route path="/Checklists" element={<Checklists />} />
                
                <Route path="/CableSystem" element={<CableSystem />} />
                
                <Route path="/WattsTriangle" element={<WattsTriangle />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}