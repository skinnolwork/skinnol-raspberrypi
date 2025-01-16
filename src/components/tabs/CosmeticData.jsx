import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import SelectableList from '../common/SelectableList';
import TabLayout from '../TapLayout';

const CosmeticData = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/api/images')
      .then(response => response.json())
      .then(imageList => {
        const formattedImages = imageList.map((image, index) => ({
          id: index + 1,
          name: image
        }));
        setImages(formattedImages);
      })
      .catch(error => console.error('Error fetching images:', error));
  }, []);

  const handleImageSelect = (img) => {
    setSelectedImage(img.id === selectedImage?.id ? null : img);
  };

  const handleAddCosmetic = () => {
    if (selectedImage) {
      navigate(`/cosmetic-data-add/${selectedImage.id}`, {
        state: {selectedImage}
      });
    }
  };

  const registerButton = (
    <Button 
      disabled={!selectedImage}
      onClick={handleAddCosmetic}
    >
      화장품 등록
    </Button>
  );

  return (
    <TabLayout button={registerButton}>
      <SelectableList 
        items={images}
        selectedItems={selectedImage ? [selectedImage] : []}
        onItemClick={handleImageSelect}
      />
    </TabLayout>
  );
};

export default CosmeticData;