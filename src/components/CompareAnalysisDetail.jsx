import React, { useMemo, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft } from 'react-feather';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ChartTitle,
  Tooltip,
  Legend
);

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

const HeaderTitle = styled.h2`
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
  const [spectrumData, setSpectrumData] = useState([]);

  const itemsWithColors = useMemo(() => {
    return selectedItems.map(item => ({
      ...item,
      color: getRandomColor()
    }));
  }, [selectedItems]);

  useEffect(() => {
    // 각 아이템의 스펙트럼 데이터를 가져오는 함수
    const fetchSpectrumData = async () => {
      const data = await Promise.all(
        itemsWithColors.map(async (item) => {
          const response = await fetch(`http://192.168.4.1:5000/api/analysis/${item.id}`);
          const result = await response.json();
          return {
            ...item,
            spectrum: result.spectrumData || []
          };
        })
      );
      setSpectrumData(data);
    };

    fetchSpectrumData();
  }, [itemsWithColors]);

  const chartData = {
    labels: spectrumData[0]?.spectrum.map((_, index) => index) || [],
    datasets: spectrumData.map((item) => ({
      label: item.name,
      data: item.spectrum,
      borderColor: item.color,
      backgroundColor: item.color,
      fill: false,
    })),
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '스펙트럼 비교 분석',
      },
    },
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft />
        </BackButton>
        <HeaderTitle>비교 분석</HeaderTitle>
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
          <Line data={chartData} options={chartOptions} />
        </GraphArea>
      </Content>
    </Container>
  );
};

export default ComparisonAnalysisDetail;
