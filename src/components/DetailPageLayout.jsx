import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ArrowLeft } from 'react-feather';
import Button from './common/Button';
import axios from 'axios';
import uPlot from 'uplot';
import 'uplot/dist/uPlot.min.css';

// ─── Styled Components ─────────────────────────────
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
  position: relative;
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

// ─── UPlotChart Component ───────────────────────────
const UPlotChart = ({ data, options }) => {
  const chartRef = useRef(null);
  const uplotRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      uplotRef.current = new uPlot(options, data, chartRef.current);
    }
    return () => {
      if (uplotRef.current) {
        uplotRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (uplotRef.current) {
      uplotRef.current.setData(data);
    }
  }, [data]);

  return <div ref={chartRef} style={{ width: options.width, height: options.height }} />;
};

// ─── Main Component ─────────────────────────────────
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

  // 이미지 및 cosmetics 데이터 불러오기
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await axios.get(`http://192.168.4.1:5000/images/${title1_Extension}`, {
          responseType: 'blob',
        });
        const imageUrl = URL.createObjectURL(response.data);
        setImage(imageUrl);
      } catch (error) {
        console.error("이미지를 불러오지 못했습니다.", error);
      }
    };
    fetchImage();

    if (title2) {
      const fetchCosmeticsData = async () => {
        try {
          const response = await axios.get(`http://192.168.4.1:5000/cosmetics/${title2_Extension}`);
          setCosmeticsData(response.data);
        } catch (error) {
          console.error("title2 데이터를 불러오지 못했습니다.", error);
        }
      };
      fetchCosmeticsData();
    }
  }, []);

  useEffect(() => {
    if (imageRef.current) {
      setImageWidth(imageRef.current.clientWidth);
    }
  }, [image]);

  // 이미지 클릭 시, 선택한 row의 스펙트럼 데이터 요청
  const handleImageClick = async (event) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const relativeY = event.clientY - rect.top;
    const row = Math.floor((event.clientY - rect.top) * (2160 / rect.height));
    setSelectedRow(relativeY);

    try {
      const response = await axios.post('http://192.168.4.1:5000/images/row-data', {
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
        return diff < 0 ? 0 : diff;
      }
      return 0;
    });
  }

  let xData = [];
  if (spectrumData) {
    const n = spectrumData.length;
    xData = Array.from({ length: n }, (_, i) => i);
  }
  const xMax = spectrumData ? spectrumData.length - 1 : 0;

  const spectrumChartData = spectrumData
    ? cosmeticsData
      ? [xData, spectrumData, cosmeticsData]
      : [xData, spectrumData]
    : [];
  const differenceChartData =
    spectrumData && cosmeticsData ? [xData, differenceData] : null;

  const chartWidth = 400;
  const chartHeight = 300;

  const spectrumChartOptions = {
    width: chartWidth,
    height: chartHeight,
    axes: [
      {
        scale: 'x',
        label: '',
        space: 40,
        values: (u, vals) => vals.map(v => Math.round(xMax - v)),
      },
      {
        scale: 'y',
        label: '',
        space: 40,
        values: (u, vals) => vals.map(v => v.toLocaleString()),
      },
    ],
    series: [
      {},
      {
        stroke: 'rgb(75,192,192)',
        width: 2,
      },
      ...(cosmeticsData
        ? [
            {
              stroke: 'rgb(255,99,132)',
              width: 2,
            },
          ]
        : []),
    ],
    legend: {
      show: false, // 범례 숨김
    },
  };

  const differenceChartOptions = {
    width: chartWidth,
    height: chartHeight,
    scales: {
      y: { auto: true },
    },
    axes: [
      {
        scale: 'x',
        label: '',
        space: 40,
        values: (u, vals) => vals.map(v => Math.round(xMax - v)),
      },
      {
        scale: 'y',
        label: '',
        space: 40,
        values: (u, vals) => vals.map(v => v.toLocaleString()),
      },
    ],
    series: [
      {}, // x축 (표시하지 않음)
      {
        stroke: 'rgb(255,165,0)',
        width: 2,
      },
    ],
    legend: {
      show: false, // 범례 숨김
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
        <Title>
          {title1} {title2 ? ` - ${title2}` : ''}
        </Title>
      </Header>
      <Content>
        <ImageContainer>
          {image ? (
            <>
              <Image
                ref={imageRef}
                src={image}
                alt="Selected Image"
                onClick={handleImageClick}
              />
              {selectedRow !== null && (
                <GreenLine position={selectedRow} width={imageWidth} />
              )}
            </>
          ) : (
            <p>이미지를 불러오는 중...</p>
          )}
        </ImageContainer>
        <GraphContainer style={{ justifyContent: title2 ? 'space-between' : 'center' }}>
          
          <GraphWrapper>
            {spectrumData && spectrumChartData.length ? (  
              <UPlotChart data={spectrumChartData} options={spectrumChartOptions} />
            ) : (
              <p>데이터 없음</p>
            )}
          </GraphWrapper>
          {cosmeticsData && Array.isArray(cosmeticsData) && cosmeticsData.length > 0 && (
            <GraphWrapper style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {differenceChartData ? (
                <UPlotChart data={differenceChartData} options={differenceChartOptions} />
              ) : (
                <p>데이터 없음</p>
              )}
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
