import React, { useState } from 'react';
import styled from 'styled-components';
import IndividualAnalysis from './tabs/IndividualAnalysis';
import ComparisonAnalysis from './tabs/ComparisonAnalysis';
import CosmeticData from './tabs/CosmeticData';

const MainTabs = () => {
  const [activeTab, setActiveTab] = useState('individual');

  const renderTabContent = () => {
    switch(activeTab) {
      case 'individual':
        return <IndividualAnalysis />;
      case 'comparison':
        return <ComparisonAnalysis />;
      case 'cosmetic':
        return <CosmeticData />;
      default:
        return null;
    }
  };

  return (
    <Container>
      <TabContainer>
        <TabButton active={activeTab === 'individual'} onClick={() => setActiveTab('individual')}>개별 분석(피부)</TabButton>
        <TabButton active={activeTab === 'comparison'} onClick={() => setActiveTab('comparison')}>비교 분석 (화장품 흡수도)</TabButton>
        <TabButton active={activeTab === 'cosmetic'} onClick={() => setActiveTab('cosmetic')}>화장품 데이터</TabButton>
      </TabContainer>
      <ContentContainer>
        {renderTabContent()}
      </ContentContainer>
    </Container>
  );
};

const Container = styled.div`
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
  background-color: #ECECEC;
  display: flex;
  flex-direction: column;
`;

const TabContainer = styled.div`
  display: flex;
  height: 7vh;
`;

const TabButton = styled.button`
  width: 20%;
  height: 100%;
  background-color: ${props => props.active ? '#ECECEC' : '#979797'};
  color: ${props => props.active ? '#000' : '#FFF'};
  font-size: 2vmin;
  border: none;
  border-radius: 10px 10px 0 0;
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  padding: 2vh 2vw;
  display: flex;
  flex-direction: column;
`;


export default MainTabs;
