import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ButtonContainer = styled.div`
  height: 15vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const TabLayout = ({ children, button }) => (
  <Container>
    <Content>{children}</Content>
    <ButtonContainer>{button}</ButtonContainer>
  </Container>
);

export default TabLayout;
