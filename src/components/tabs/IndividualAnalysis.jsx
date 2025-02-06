import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../common/Button';
import SelectableList from '../common/SelectableList';
import TabLayout from '../TapLayout';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const IndividualAnalysis = () => {
  const [items, setItems] = useState([]);
  const [cosmetics, setCosmetics] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCosmetic, setSelectedCosmetic] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('http://192.168.12.150:5000/images');
        const fetchedImages = response.data.map((name) => ({
          name: name,
        }));
        setItems(fetchedImages);
      } catch (error) {
        console.log("이미지를 불러올 수 없습니다.");
      }
    };

    fetchImages();

    const fetchCosmetics = async () => {
      try {
        const response = await axios.get('http://192.168.12.150:5000/cosmetics');
        const fetchedCosmetics = response.data.map((name) => ({
          name: name,
        }));
        setCosmetics(fetchedCosmetics);
      } catch (error) {
        console.log("이미지를 불러올 수 없습니다.")
      }
    }

    fetchCosmetics();
  }, [items, cosmetics]);

  const handleImageSelect = (img) => {
    setSelectedImage(img.name === selectedImage?.name ? null : img);
  };

  const handleCosmeticSelect = (cosmetic) => {
    setSelectedCosmetic(cosmetic.name === selectedCosmetic?.name ? null : cosmetic);
  };

  const handleAnalyze = () => {
    if (selectedImage && selectedCosmetic) {
      navigate(`/individual-analysis/${selectedImage.name}/${selectedCosmetic.name}`, { state: { selectedImage, selectedCosmetic } });
    }
  };

  const analyzeButton = (
    <Button
      disabled={!selectedImage || !selectedCosmetic}
      onClick={handleAnalyze}
    >
      개별 분석하기
    </Button>
  );

  const handleDeleteImage = async (name) => {
    try {
      const response = await axios.delete(`http://192.168.12.150:5000/images/${name}`);
      if (response.status === 200) {
        setItems((prevItems) => prevItems.filter((item) => item.name !== name));
        if (selectedImage?.name === name) {
          setSelectedImage(null);
        }
        console.log('이미지 삭제 성공:', response.data);
      } else {
        console.error('이미지 삭제 실패:', response.data);
      }
    } catch (error) {
      console.error('이미지 삭제 중 오류 발생:', error);
    }
  };

  const handleDeleteCosmetic = async (name) => {
    try {
      const response = await axios.delete(`http://192.168.12.150:5000/cosmetics/${name}`);
      if (response.status === 200) {
        setCosmetics((prevCosmetics) => prevCosmetics.filter((cosmetic) => cosmetic.name !== name));
        if (selectedCosmetic?.name === name) {
          setSelectedCosmetic(null);
        }
        console.log('화장품 삭제 성공:', response.data);
      } else {
        console.error('화장품 삭제 실패:', response.data);
      }
    } catch (error) {
      console.error('화장품 삭제 중 오류 발생:', error);
    }
  };

  return (
    <TabLayout button={analyzeButton}>
      <PanelContainer>
        <Panel>
          <SelectableList
            items={items.map(item => ({ ...item, name: item.name.split('.').slice(0, -1).join('.') }))}
            selectedItems={selectedImage ? [selectedImage] : []}
            onItemClick={handleImageSelect}
            showDeleteButton={true}
            onDelete={(item) => handleDeleteImage(item)}
          />
        </Panel>
        <Panel>
          <SelectableList
            items={cosmetics.map(item => ({ ...item, name: item.name.split('.').slice(0, -1).join('.') }))}
            selectedItems={selectedCosmetic ? [selectedCosmetic] : []}
            onItemClick={handleCosmeticSelect}
            showDeleteButton={true} // 화장품 리스트에 삭제 버튼 활성화
            onDelete={(item) => handleDeleteCosmetic(item)} // 화장품 삭제 핸들러 연결
          />
        </Panel>
      </PanelContainer>
    </TabLayout>
  );
};

const PanelContainer = styled.div`
  display: flex;
  height: 100%;
`;

const Panel = styled.div`
  width: 50%;
  padding: 1rem 1rem 2rem 1rem;
  overflow-y: auto;
`;


export default IndividualAnalysis;