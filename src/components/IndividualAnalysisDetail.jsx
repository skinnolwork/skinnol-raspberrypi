import React, { useState, useEffect, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import DetailPageLayout from './DetailPageLayout';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const IndividualAnalysisDetail = () => {
  const { imageId, cosmeticId } = useParams();
  const location = useLocation();
  const { selectedImage, selectedCosmetic } = location.state || {};
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalysis = (spectrumData) => {
    const cosmeticSpectrum = selectedCosmetic.spectrum;
    console.log(typeof spectrumData);
    console.log(typeof cosmeticSpectrum)
    const minLength = Math.min(spectrumData.length, cosmeticSpectrum.length);
    const difference = spectrumData.slice(0, minLength).map((value, index) => 
      value - cosmeticSpectrum[index]
    );

    setAnalysisResult({ difference });
  };

  const comparisonGraph = () => {
    if (!analysisResult || !analysisResult.difference) {
      // 데이터가 없을 때 빈 그래프 렌더링
      const emptyChartData = {
        labels: [],
        datasets: [{
          label: '데이터 없음',
          data: [],
          borderColor: 'rgb(200, 200, 200)',
        }]
      };
  
      const emptyChartOptions = {
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: '스펙트럼 비교 분석 (데이터 없음)',
          },
        },
      };
  
      return <Line data={emptyChartData} options={emptyChartOptions} />;
    }
    
    const chartData = {
      labels: Array.from({ length: analysisResult.difference.length }, (_, i) => i + 1),
      datasets: [
        {
          label: '스펙트럼 차이',
          data: analysisResult.difference,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
        },
      ],
    };
  
    const options = {
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
  
    return <Line data={chartData} options={options} />;
  };
  

  return (
    <DetailPageLayout
      title={`${selectedImage.name} - ${selectedCosmetic.name}`}
      image={selectedImage}
      additionalGraph={comparisonGraph}
      buttonText="분석 저장하기"
      onButtonClick={handleAnalysis}
      showComparisonGraph={true}
    />
  );
};

export default IndividualAnalysisDetail;
