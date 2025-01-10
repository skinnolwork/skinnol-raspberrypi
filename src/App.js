import React from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Home from './components/Home';
import MainTabs from './components/MainTabs';
import IndividualAnalysisDetail from './components/IndividualAnalysisDetail';
import ComparisonAnalysisDetail from './components/CompareAnalysisDetail';
import './App.css';
import CosmeticDataAdd from './components/CosmeticDataAdd';

function App() {
  return (
    <Router>
      <AppContainer>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/main" element={<MainTabs />} />
          <Route path="/individual-analysis/:imageId/:cosmeticId" element={<IndividualAnalysisDetail />} />
          <Route path="/comparison-analysis-detail" element={<ComparisonAnalysisDetail />} />
          <Route path="/cosmetic-data-add/:imageId" element={<CosmeticDataAdd />} />
        </Routes>
      </AppContainer>
    </Router>
  );
}

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
  background-color: #ECECEC;
`;

export default App;
