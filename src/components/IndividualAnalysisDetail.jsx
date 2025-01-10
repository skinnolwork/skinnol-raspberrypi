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

  if (!selectedImage || !selectedCosmetic) {
    return <div>데이터를 찾을 수 없습니다.</div>;
  }

  const handleSaveAnalysis = () => {
    // 분석 저장 로직
  };

  const comparisonGraph = () => (
    <div>일치도 그래프</div>
  );

  return (
    <DetailPageLayout
      title={`${selectedImage.name} - ${selectedCosmetic.name}`}
      image={selectedImage}
      additionalGraph={comparisonGraph}
      buttonText="분석 저장하기"
      onButtonClick={handleSaveAnalysis}
      showComparisonGraph={true}
    />
  );
};

export default IndividualAnalysisDetail;
