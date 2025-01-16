import React from 'react';
import styled from 'styled-components';
import Text from './Text';
import Button from './Button';

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
    return (
      <List>
        {items.map(item => (
          <ListItem key={item.id}>
            <ItemContent onClick={() => onItemClick(item)}>
              <Bullet selected={selectedItems.some(selectedItem => selectedItem.id === item.id)} />
              <Text>{item.name}</Text>
            </ItemContent>
            {showDeleteButton && (
            <DeleteButton onClick={() => onDelete(item.id)}>
            삭제
          </DeleteButton>
            )}
          </ListItem>
        ))}
      </List>
    );
  };
  
  export default SelectableList;