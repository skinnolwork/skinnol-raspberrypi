import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from './Button';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <Title>피부 분석 앱</Title>
      <Button onClick={() => navigate('/main')}>시작하기</Button>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
`;

export default Home;
