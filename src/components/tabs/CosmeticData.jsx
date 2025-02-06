import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../common/Button';
import SelectableList from '../common/SelectableList';
import TabLayout from '../TapLayout';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const CosmeticData = () => {
  const [items, setItems] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get('http://192.168.12.150:5000/images');
        const fetchedImages = response.data.map((name) => ({
          id: uuidv4(),
          name: name,
        }));
        setItems(fetchedImages);
      } catch (error) {
        console.log("이미지를 불러올 수 없습니다.");
      }
    };
    fetchImages();
  }, []);

  const handleImageSelect = (items) => {
    setSelectedImage(items.id === selectedImage?.id ? null : items);
  };

  const handleAddCosmetic = () => {
    if (selectedImage) {
      console.log(selectedImage.name)
      navigate(`/cosmetic-data-add/${selectedImage.name}`, {
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
        items={items.map(item => ({ ...item, name: item.name.split('.').slice(0, -1).join('.') }))}
        selectedItems={selectedImage ? [selectedImage] : []}
        onItemClick={handleImageSelect}
      />
    </TabLayout>
  );
};

export default CosmeticData;