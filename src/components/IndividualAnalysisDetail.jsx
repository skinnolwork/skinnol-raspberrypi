import React, { useState, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
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
import Modal from './common/Modal';

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
  const navigate = useNavigate();
  const { selectedImage, selectedCosmetic } = location.state || {};
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const calculateDifference = useCallback((spectrumData) => {
    const cosmeticSpectrum = selectedCosmetic.spectrum;
    const minLength = Math.min(spectrumData.length, cosmeticSpectrum.length);
    const difference = spectrumData.slice(0, minLength).map((value, index) => 
      value - cosmeticSpectrum[index]
    );
    setAnalysisResult({
      id: `${imageId}_${cosmeticId}`,
      name: `${selectedImage.name} - ${selectedCosmetic.name}`,
      spectrumData: difference
    });
  }, [selectedCosmetic, selectedImage]);

  const handleSpectrumDataUpdate = (spectrumData) => {
    calculateDifference(spectrumData);
  };

  const handleSaveAnalysis = () => {
    if (!analysisResult) return;

    fetch('http://localhost:5000/api/save-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageId,
        cosmeticId,
        analysisResult
      }),
    })
    .then(response => response.json())
    .then(data => {
      console.log('Analysis saved:', data);
      setIsSuccessModalOpen(true);
    })
    .catch(error => {
      console.error('Error saving analysis:', error);
      setIsErrorModalOpen(true);
    });
  };

  const comparisonGraph = () => {
    if (!analysisResult || !analysisResult.spectrumData) {
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
      labels: Array.from({ length: analysisResult.spectrumData.length }, (_, i) => i + 1),
      datasets: [
        {
          label: '스펙트럼 차이',
          data: analysisResult.spectrumData,
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

  const handleSuccessModalClose = () => {
    setIsSuccessModalOpen(false);
    navigate(-1); // 이전 페이지로 이동
  };
  

  return (
    <>
    <DetailPageLayout
      title1={`${selectedImage.name}`}
      title2={`${selectedCosmetic.name}`}
      image={selectedImage}
      additionalGraph={comparisonGraph}
      buttonText="분석 저장하기"
      onButtonClick={handleSaveAnalysis}
      onSpectrumDataUpdate={handleSpectrumDataUpdate}
      showComparisonGraph={true}
    />
    <Modal
    isOpen={isSuccessModalOpen}
    onClose={handleSuccessModalClose}
    singleButton={true}
  >
    개별 분석이 완료되었습니다
  </Modal>
  <Modal
    isOpen={isErrorModalOpen}
    onClose={() => setIsErrorModalOpen(false)}
    singleButton={true}
  >
    개별 분석 과정에서 오류가 발생하였습니다. 잠시 후에 다시 시도해주세요.
  </Modal>
    </>
  );
};

export default IndividualAnalysisDetail;
