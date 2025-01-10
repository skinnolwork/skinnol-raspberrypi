import React from 'react';
import styled from 'styled-components';

const Button = ({ children, ...props }) => (
  <StyledButton {...props}>{children}</StyledButton>
);

const StyledButton = styled.button`
  width: 50%;
  height: 8vh;
  background-color: #7385FF;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 3vmin;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 2vh auto;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default Button;