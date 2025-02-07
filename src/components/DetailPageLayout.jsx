import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft } from 'react-feather';
import Button from './common/Button';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

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
  position: relative;
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

const GreenLine = styled.div`
  position: absolute;
  height: 2px;
  background-color: green;
  width: ${({ width }) => width}px;
  top: ${({ position }) => position}px;
  left: 50%;
  transform: translateX(-50%);
  transition: top 0.2s ease-in-out, width 0.2s ease-in-out;
`;

const DetailPageLayout = ({ title1, title2, buttonText, onButtonClick }) => {
  const navigate = useNavigate();
  const [image, setImage] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [spectrumData, setSpectrumData] = useState(null);
  const [cosmeticsData, setCosmeticsData] = useState(null);
  const [imageWidth, setImageWidth] = useState(0);
  const imageRef = useRef(null);
  const title1_Extension = title1 + '.png';
  const title2_Extension = title2 + '.json';

  useEffect(() => {
    const img = async () => {
      try {
        const response = await axios.get(`http://192.168.12.40:5000/images/${title1_Extension}`, {
          responseType: 'blob'
        });

        const imageUrl = URL.createObjectURL(response.data);
        setImage(imageUrl);
      } catch (error) {
        console.error("이미지를 불러오지 못했습니다.", error);
      }
    };
    img();

    if (!title2) return; // title2가 없으면 실행 안 함

    const fetchCosmeticsData = async () => {
      try {
        const response = await axios.get(`http://192.168.12.40:5000/cosmetics/${title2_Extension}`); // JSON 파일 가져오기
        setCosmeticsData(response.data); // 데이터 저장
      } catch (error) {
        console.error("title2 데이터를 불러오지 못했습니다.", error);
      }
    };

    fetchCosmeticsData();
  }, []);

  useEffect(() => {
    if (imageRef.current) {
      setImageWidth(imageRef.current.clientWidth); // ✅ 이미지 너비 업데이트
    }
  }, [image]); 

  const handleImageClick = async (event) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const relativeY = event.clientY - rect.top; // 클릭한 위치 (이미지 내부 기준)
    const row = Math.floor((event.clientY - rect.top) * (2160 / rect.height));
    setSelectedRow(relativeY);

    try {
      const response = await axios.post('http://192.168.12.40:5000/images/row-data', {
        filename: title1_Extension,
        row: row,
      });

      setSpectrumData(response.data.row_data);
    } catch (error) {
      console.error("Row 데이터를 불러오지 못했습니다.", error);
    }
  };

  let differenceData = [];

  if (spectrumData && cosmeticsData) {
    differenceData = cosmeticsData.map((value, index) => {
      if (spectrumData[index] !== undefined) {
        const diff = value - spectrumData[index];
        return diff < 0 ? 0 : diff; // 음수는 0으로 처리
      }
      return 0; // 데이터가 없을 경우 0으로 처리
    });
  }


  const reversedLabels = spectrumData
  ? Array.from({ length: spectrumData.length }, (_, i) => spectrumData.length - 1 - i)
  : [];

  const chartData = {
    labels: reversedLabels,
    datasets: [
      {
        label: '스펙트럼 데이터',
        data: spectrumData || [],
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 2,
        tension: 0.04,
        pointRadius: 0,
      },
      ...(cosmeticsData
        ? [
          {
            label: `${title2.replace('.json', '')} 비교 데이터`,
            data: cosmeticsData || [],
            borderColor: 'rgb(255, 99, 132)',
            borderWidth: 2,
            tension: 0.04,
            pointRadius: 0,
          },
        ]
        : []),
    ],
  };
  const differenceChartData = {
    labels: reversedLabels,
    datasets: [
      {
        label: '차이 (cosmeticsData - spectrumData)',
        data: differenceData || [],
        borderColor: 'rgb(255, 165, 0)', // 주황색
        borderWidth: 2,
        tension: 0.04,
        pointRadius: 0,
      }
    ]
  };


  const chartOptions = {
    responsive: true,
    animation: false,
    plugins: {
      legend: {
        display: false,
      },
      title1: {
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
      title1: {
        ...chartOptions.plugins.title1,
        text: '열을 선택하세요',
      },
    },
  };

  const handleButtonClick = () => {
    onButtonClick(spectrumData);
  };

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft />
        </BackButton>
        <Title>{title1} {title2 ? ` - ${title2}` : ''}</Title>
      </Header>
      <Content>
        <ImageContainer>
          {image ? (
            <>
              <Image ref={imageRef} src={image} alt="Selected Image" onClick={handleImageClick} />
              {selectedRow !== null && <GreenLine position={selectedRow} width={imageWidth} />}
            </>
          ) : (
            <p>이미지를 불러오는 중...</p>
          )}
        </ImageContainer>
        <GraphContainer style={{ justifyContent: title2 ? 'space-between' : 'center' }}>
          <GraphWrapper>
            <Line data={spectrumData ? chartData : emptyChartData} options={spectrumData ? chartOptions : emptyChartOptions} />
          </GraphWrapper>
          {cosmeticsData && Array.isArray(cosmeticsData) && cosmeticsData.length > 0 && (
            <GraphWrapper style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Line data={differenceChartData ? emptyChartData : emptyChartData} options={{ ...chartOptions, indexAxis: 'y', title: { text: '차이 (cosmeticsData - spectrumData)' } }} />
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
