import React from 'react';

const Text = ({ children, ...props }) => <p {...props}>{children}</p>;

export default Text;