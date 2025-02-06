import React, { useState } from 'react';
import styled from 'styled-components';
import Text from './Text';
import Button from './Button';
import Modal from './Modal';


const List = styled.ul`
  list-style-type: none;
  height: 60vh;
  padding: 10px;
  flex: 1;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  padding-right: 10px;
`;

const Bullet = styled.span`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.selected ? '#7385FF' : '#ccc'};
  margin-right: 10px;
`;

const ItemContent = styled.div`
  display: flex;
  align-items: center;
  flex-grow: 1;
  margin-right: ${props => (props.hasDeleteButton ? '10px' : '0')};
`;

const DeleteButton = styled(Button)`
  width: auto;
  height: auto;
  padding: 0.6rem;
  background-color: #E88484;
  color: #000;
  border-radius: 10px;
  font-size: 2vmin;
  font-weight: 400;
  margin-left: 10px; // 내용과 버튼 사이에 약간의 간격 추가
`;

const SelectableList = ({ items, selectedItems, onItemClick, showDeleteButton, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetToDelete, setTargetToDelete] = useState(null);

  const handleDeleteClick = (name) => {
    setTargetToDelete(name);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = () => {
    onDelete(targetToDelete);
    setIsModalOpen(false);
    setTargetToDelete(null);
  };

  return (
    <>
      <List>
        {items.map(item => (
          <ListItem key={item.name}>
            <ItemContent onClick={() => onItemClick(item)}>
              <Bullet selected={selectedItems.some(selectedItem => selectedItem.name === item.name)} />
              <Text>{item.name}</Text>
            </ItemContent>
            {showDeleteButton && (
              <DeleteButton onClick={() => {
                handleDeleteClick(item.name)
              }}>
                삭제
              </DeleteButton>
            )}
          </ListItem>
        ))}
      </List>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmDelete}
      >
        정말 삭제하시겠습니까?
      </Modal>
    </>
  );
};

export default SelectableList;