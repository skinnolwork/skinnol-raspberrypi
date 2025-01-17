import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft } from 'react-feather';
import Button from './common/Button';
import { Line } from 'react-chartjs-2';

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
`;

const BackButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  position: absolute;
  left: 20px;
`;

const Title = styled.h2`
  margin-left: 1rem;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 1rem;
`;

const ImageContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
`;

const Image = styled.img`
  max-height: 30vh;
  object-fit: contain;
`;

const GraphContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const GraphWrapper = styled.div`
  width: 48%;
  height: 300px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  padding: 10px;
  display: flex;
  justify-content: center;
`;

const ButtonContainer = styled.div`
  padding: 1rem;
`;

const DetailPageLayout = ({ title, image, additionalGraph, buttonText, onButtonClick, showComparisonGraph = false, onSpectrumDataUpdate }) => {
  const navigate = useNavigate();
  const [selectedRow, setSelectedRow] = useState(null);
  const [spectrumData, setSpectrumData] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const img = document.querySelector('img[alt="Selected Image"]');
    if (img) {
      imageRef.current = img;
      img.addEventListener('click', handleImageClick);
      setupCanvas();
      return () => img.removeEventListener('click', handleImageClick);
    }
  }, []);

  const setupCanvas = () => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.style.position = 'absolute';
      canvasRef.current.style.pointerEvents = 'none';
      imageRef.current.parentNode.style.position = 'relative';
      imageRef.current.parentNode.appendChild(canvasRef.current);
    }
    const rect = imageRef.current.getBoundingClientRect();
    canvasRef.current.style.top = `${imageRef.current.offsetTop}px`;
    canvasRef.current.style.left = `${imageRef.current.offsetLeft}px`;
    canvasRef.current.width = rect.width;
    canvasRef.current.height = rect.height;
  };

  const handleImageClick = (event) => {
    setupCanvas();
    const img = imageRef.current;
    const rect = img.getBoundingClientRect();
    const scaleY = img.naturalHeight / img.height;
    
    const y = (event.clientY - rect.top) * scaleY;
    const row = Math.floor(y);
    setSelectedRow(row);

    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.beginPath();
    ctx.strokeStyle = 'green';
    ctx.lineWidth = 2;
    
    const lineY = y / scaleY;
    ctx.moveTo(0, lineY);
    ctx.lineTo(canvasRef.current.width, lineY);
    ctx.stroke();

    // 스펙트럼 데이터 추출 로직
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = img.naturalWidth;
    offscreenCanvas.height = img.naturalHeight;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    offscreenCtx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
    const imageData = offscreenCtx.getImageData(0, row, img.naturalWidth, 1).data;
    const newSpectrumData = [];
    for (let i = 0; i < imageData.length; i += 4) {
      newSpectrumData.push(imageData[i]);
    }
    setSpectrumData(newSpectrumData);

    if (onSpectrumDataUpdate) {
      onSpectrumDataUpdate(newSpectrumData);
    }
  };

  const chartData = {
    labels: spectrumData ? Array.from({ length: spectrumData.length }, (_, i) => i) : [],
    datasets: [
      {
        label: '스펙트럼 데이터',
        data: spectrumData || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: '선택된 Row의 스펙트럼 데이터',
      },
    },
  };

  const emptyChartData = {
    labels: [],
    datasets: [{
      label: '데이터 없음',
      data: [],
      borderColor: 'rgb(200, 200, 200)',
    }]
  };

  const emptyChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        ...chartOptions.plugins.title,
        text: '열을 선택하세요',
      },
    },
  };

  const handleButtonClick = () => {
    onButtonClick(selectedRow, spectrumData);
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft />
        </BackButton>
        <Title>{title}</Title>
      </Header>
      <Content>
        <ImageContainer>
          <Image src={`/images/${image.name}`} alt="Selected Image" />
        </ImageContainer>
        <GraphContainer style={{ justifyContent: showComparisonGraph ? 'space-between' : 'center' }}>
          <GraphWrapper>
            <Line data={spectrumData ? chartData : emptyChartData} options={spectrumData ? chartOptions : emptyChartOptions} />
          </GraphWrapper>
          {showComparisonGraph && (
            <GraphWrapper>
              {additionalGraph ? additionalGraph() : 
                <Line data={emptyChartData} options={{...emptyChartOptions, plugins: {...emptyChartOptions.plugins, title: {...emptyChartOptions.plugins.title, text: '비교 데이터'}}}} />
              }
            </GraphWrapper>
          )}
        </GraphContainer>
      </Content>
      <ButtonContainer>
        <Button onClick={handleButtonClick} disabled={!selectedRow || !spectrumData}>
          {buttonText}
        </Button>
      </ButtonContainer>
    </Container>
  );
};

export default DetailPageLayout;
