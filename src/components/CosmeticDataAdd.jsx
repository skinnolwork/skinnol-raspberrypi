import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import DetailPageLayout from './DetailPageLayout';
import Modal from './common/Modal';
import styled from 'styled-components';

const ModalContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 14px;
`;

const Input = styled.input`
  width: 100%;
  height: 40px;
  margin-top: 20px;
  margin-bottom: 10px;
  padding: 0 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const CosmeticDataAdd = () => {
  const { imageId } = useParams();
  const location = useLocation();
  const { selectedImage } = location.state || {};
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cosmeticName, setCosmeticName] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [spectrumData, setSpectrumData] = useState(null);

  if (!selectedImage) {
    return <div>데이터를 찾을 수 없습니다.</div>;
  }

  const handleAddCosmetic = (row, spectrum) => {
    setSelectedRow(row);
    setSpectrumData(spectrum);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    const cosmeticId = Date.now(); // 간단한 ID 생성 (현재 시간)
    
    // 화장품 데이터 저장 요청
    fetch('http://localhost:5000/api/cosmetics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: cosmeticId,
        name: cosmeticName,
        spectrum: spectrumData // 선택된 row의 스펙트럼 데이터
      }),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.message);
      setIsModalOpen(false);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
    
    setCosmeticName(''); // 입력 필드 초기화
  }

  return (
    <>
      <DetailPageLayout
        title={selectedImage.name}
        image={selectedImage}
        buttonText="저장하기"
        onButtonClick={handleAddCosmetic}
      />
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirm}
      >
        <ModalContent>
          화장품 이름을 입력하세요
          <Input 
            type="text" 
            value={cosmeticName} 
            onChange={(e) => setCosmeticName(e.target.value)}
            placeholder="화장품 이름"
          />
        </ModalContent>
      </Modal>
    </>
  );
};

export default CosmeticDataAdd;
