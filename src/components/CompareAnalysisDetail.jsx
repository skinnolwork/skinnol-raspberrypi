import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft } from 'react-feather';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  padding: 1rem 0;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  position: absolute;
  left: 20px;
`;

const Title = styled.h2`
  margin: 0;
`;

const Content = styled.div`
  display: flex;
  flex: 1;
`;

const Sidebar = styled.div`
  width: 30%;
  padding: 1rem;
  background-color: #f0f0f0;
  overflow-y: auto;
`;

const GraphArea = styled.div`
  width: 70%;
  padding: 1rem;
`;

const ColoredItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const ColorSquare = styled.span`
  width: 20px;
  height: 20px;
  margin-right: 10px;
  display: inline-block;
`;

// 랜덤 색상 생성 함수
const getRandomColor = () => {
  return '#' + Math.floor(Math.random()*16777215).toString(16);
};

const ComparisonAnalysisDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedItems = location.state?.selectedItems || [];

  const itemsWithColors = useMemo(() => {
    return selectedItems.map(item => ({
      ...item,
      color: getRandomColor()
    }));
  }, [selectedItems]);

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft />
        </BackButton>
        <Title>비교 분석</Title>
      </Header>
      <Content>
        <Sidebar>
        {itemsWithColors.map((item) => (
            <ColoredItem key={item.id}>
              <ColorSquare style={{ backgroundColor: item.color }} />
              {item.name}
            </ColoredItem>
          ))}
        </Sidebar>
        <GraphArea>
          {/* 그래프 컴포넌트를 여기에 추가 */}
          <div>그래프가 여기에 렌더링됩니다.</div>
                    {/* 예시: 각 아이템의 색상 출력 */}
        </GraphArea>
      </Content>
    </Container>
  );
};

export default ComparisonAnalysisDetail;
