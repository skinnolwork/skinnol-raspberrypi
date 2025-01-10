import React from 'react';
import styled from 'styled-components';

const ModalBackground = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ModalContent = styled.div`
  background-color: #d8d8d8;
  padding: 20px;
  border-radius: 10px;
  width: 300px;
  font-size: 9pt;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ModalText = styled.p`
  text-align: center;
  font-weight: normal;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  width: 100%;
`;

const Button = styled.button`
  width: 40%;
  height: 40px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
`;

const Modal = ({ isOpen, onClose, onConfirm, children }) => {
  if (!isOpen) return null;

  return (
    <ModalBackground onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <ModalText>{children}</ModalText>
        <ButtonContainer>
          <Button onClick={onClose}>취소</Button>
          <Button onClick={onConfirm}>확인</Button>
        </ButtonContainer>
      </ModalContent>
    </ModalBackground>
  );
};

export default Modal;