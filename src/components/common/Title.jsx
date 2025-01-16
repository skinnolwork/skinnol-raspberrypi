import React from 'react';

const Title = ({ level = 'h1', children, ...props }) => {
  const Tag = level;
  return <Tag {...props}>{children}</Tag>;
};

export default Title;