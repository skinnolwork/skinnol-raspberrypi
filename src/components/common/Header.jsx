import React from 'react';
import Title from './Title';

const Header = ({ title, leftComponent, rightComponent, ...props }) => (
  <header {...props}>
    {leftComponent}
    <Title level="h1">{title}</Title>
    {rightComponent}
  </header>
);

export default Header;