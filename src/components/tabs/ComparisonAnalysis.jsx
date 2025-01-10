import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Text from '../Text';
import Button from '../Button';
import SelectableList from '../common/SelectableList';
import TabLayout from '../TapLayout';

const ComparisonAnalysis = () => {
    const [analysisResults, setAnalysisResults] = useState([]);
    const [selectedAnalyses, setSelectedAnalyses] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
      fetch('http://localhost:5000/api/images')
        .then(response => response.json())
        .then(images => {
          const results = images.map((image, index) => ({
            id: index + 1,
            name: image
          }));
          setAnalysisResults(results);
        })
        .catch(error => console.error('Error fetching images:', error));
    }, []);
  
    const toggleAnalysis = (analysis) => {
      setSelectedAnalyses(prev => {
        if (prev.find(a => a.id === analysis.id)) {
          return prev.filter(a => a.id !== analysis.id);
        } else if (prev.length < 4) {
          return [...prev, analysis];
        }
        return prev;
      });
    };

      const handleCompare = () => {
        if (selectedAnalyses.length >= 2) {
          navigate('/comparison-analysis-detail', { state: { selectedItems: selectedAnalyses } });
        }
      };
    

      const compareButton = (
        <Button 
          disabled={selectedAnalyses.length < 2}
          onClick={handleCompare}
        >
          비교 분석하기
        </Button>
      );
    
  
      return (
        <TabLayout button={compareButton}>
          <Text>최대 4개 비교 가능</Text>
          <SelectableList 
            items={analysisResults}
            selectedItems={selectedAnalyses}
            onItemClick={toggleAnalysis}
          />
        </TabLayout>
      );
  };
  
export default ComparisonAnalysis;