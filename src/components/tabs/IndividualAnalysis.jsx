import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import Button from '../Button';
import SelectableList from '../common/SelectableList';
import TabLayout from '../TapLayout';

const IndividualAnalysis = () => {
    const [images, setImages] = useState([]);
    const [cosmetics, setCosmetics] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedCosmetic, setSelectedCosmetic] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
      fetch('http://localhost:5000/api/images')
        .then(response => response.json())
        .then(imageList => {
          const formattedImages = imageList.map((image, index) => ({
            id: index + 1,
            name: image,
            isDeleted: false
          }));
          setImages(formattedImages);
        })
        .catch(error => console.error('Error fetching images:', error));


        fetch('http://localhost:5000/api/cosmetics')
        .then(response => response.json())
        .then(cosmeticList => {
          setCosmetics(cosmeticList);
        })
        .catch(error => console.error('Error fetching cosmetics:', error));
    }, []);
  
    const handleImageSelect = (img) => {
      setSelectedImage(img.id === selectedImage?.id ? null : img);
    };
  
    const handleCosmeticSelect = (cosmetic) => {
      setSelectedCosmetic(cosmetic.id === selectedCosmetic?.id ? null : cosmetic);
    };

    const handleDeleteImage = (id) => {
        setImages(images.map(img => 
          img.id === id ? { ...img, isDeleted: true } : img
        ));
        if (selectedImage?.id === id) setSelectedImage(null);
      };
 
      
      const handleAnalyze = () => {
        if (selectedImage && selectedCosmetic) {
          navigate(`/individual-analysis/${selectedImage.id}/${selectedCosmetic.id}`, {state: {selectedImage, selectedCosmetic}});
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
  
      return (
        <TabLayout button={analyzeButton}>
          <PanelContainer>
            <Panel>
              <SelectableList 
                items={images}
                selectedItems={selectedImage ? [selectedImage] : []}
                onItemClick={handleImageSelect}
                showDeleteButton={true}
                onDelete={handleDeleteImage}
              />
            </Panel>
            <Panel>
              <SelectableList 
                items={cosmetics}
                selectedItems={selectedCosmetic ? [selectedCosmetic] : []}
                onItemClick={handleCosmeticSelect}
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