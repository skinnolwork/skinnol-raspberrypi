const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 5000;

// CORS 미들웨어 추가
const cors = require('cors');
app.use(cors());

// Body parser 미들웨어 추가
app.use(express.json());

// 정적 파일 서빙 설정
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/api/images', (req, res) => {
  const imageDir = path.join(__dirname, '..', 'public', 'images');
  fs.readdir(imageDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan directory' });
    }
    const images = files.filter(file => 
      ['.jpg', '.jpeg', '.png', '.gif', '.bmp'].includes(path.extname(file).toLowerCase())
    );
    res.json(images);
  });
});

// 화장품 정보를 저장하는 API
app.post('/api/cosmetics', (req, res) => {
  const { id, name, spectrum } = req.body;

  const filePath = path.join(__dirname, '..', 'public', 'cosmetics', `${id}.json`);
  
  const cosmeticData = {
    id,
    name,
    spectrum
  };

  fs.writeFile(filePath, JSON.stringify(cosmeticData), (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to save cosmetic data' });
    }
    res.status(200).json({ message: 'Cosmetic data saved successfully' });
  });
});

// 화장품 목록을 가져오는 API
app.get('/api/cosmetics', (req, res) => {
  const cosmeticDir = path.join(__dirname, '..', 'public', 'cosmetics');
  fs.readdir(cosmeticDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan directory' });
    }
    const cosmeticFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');
    
    const cosmetics = cosmeticFiles.map(file => {
      const filePath = path.join(cosmeticDir, file);
      const rawData = fs.readFileSync(filePath);
      return JSON.parse(rawData);
    });

    res.json(cosmetics);
  });
});

app.get('/api/analyses', (req, res) => {
  const analysisDir = path.join(__dirname, '..', 'public', 'analysis');
  fs.readdir(analysisDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan directory' });
    }
    const analyseFiles = files.filter(file => path.extname(file).toLowerCase() === '.json');

    const analyses = analyseFiles.map(file => {
      const filePath = path.join(analysisDir, file);
      const rawData = fs.readFileSync(filePath);
      return JSON.parse(rawData);
    })
    res.json(analyses);
  });
});

app.get('/api/analysis/:id', (req, res) => {
  const analysisId = req.params.id;
  const analysisDir = path.join(__dirname, '..', 'public', 'analysis');
  const analysisFilePath = path.join(analysisDir, `${analysisId}.json`);
  fs.readFile(analysisFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('분석 데이터 읽기 오류:', err);
      return res.status(500).json({ error: '분석 데이터를 읽는 중 오류가 발생했습니다.' });
    }

    try {
      const analysisData = JSON.parse(data);
      res.json({ spectrumData: analysisData.spectrumData });
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      res.status(500).json({ error: 'JSON 파싱 중 오류가 발생했습니다.' });
    }
  });
});

app.post('/api/individual-analysis', (req, res) => {
  const { imageId, cosmeticId } = req.body;

  const imagePath = path.join(__dirname, '..', 'public', 'images', `${imageId}.json`);
  const cosmeticPath = path.join(__dirname, '..', 'public', 'cosmetics', `${cosmeticId}.json`);

  try {
    const imageData = JSON.parse(fs.readFileSync(imagePath, 'utf8'));
    const cosmeticData = JSON.parse(fs.readFileSync(cosmeticPath, 'utf8'));

    const imageSpectrum = imageData.spectrum;
    const cosmeticSpectrum = cosmeticData.spectrum;

    // 스펙트럼 길이가 다를 경우 처리
    const minLength = Math.min(imageSpectrum.length, cosmeticSpectrum.length);
    const truncatedImageSpectrum = imageSpectrum.slice(0, minLength);
    const truncatedCosmeticSpectrum = cosmeticSpectrum.slice(0, minLength);

    const difference = truncatedImageSpectrum.map((value, index) => value - truncatedCosmeticSpectrum[index]);
    const correlation = calculateCorrelation(truncatedImageSpectrum, truncatedCosmeticSpectrum);

    const analysisResult = {
      imageId,
      cosmeticId,
      difference,
      correlation
    };

    res.json(analysisResult);
  } catch (error) {
    console.error('분석 중 오류 발생:', error);
    res.status(500).json({ error: '분석 중 오류가 발생했습니다.' });
  }
});

function calculateCorrelation(x, y) {
  const n = x.length;
  let sum_x = 0, sum_y = 0, sum_xy = 0, sum_x2 = 0, sum_y2 = 0;

  for (let i = 0; i < n; i++) {
    sum_x += x[i];
    sum_y += y[i];
    sum_xy += x[i] * y[i];
    sum_x2 += x[i] * x[i];
    sum_y2 += y[i] * y[i];
  }

  const numerator = n * sum_xy - sum_x * sum_y;
  const denominator = Math.sqrt((n * sum_x2 - sum_x * sum_x) * (n * sum_y2 - sum_y * sum_y));

  if (denominator === 0) return 0; // 분모가 0인 경우 상관계수를 0으로 처리

  return numerator / denominator;
}


app.post('/api/save-analysis', (req, res) => {
  const { imageId, cosmeticId, analysisResult } = req.body;

  try {
    const analysisDir = path.join(__dirname, '..', 'public', 'analysis');
    if (!fs.existsSync(analysisDir)) {
      fs.mkdirSync(analysisDir);
    }

    const analysisFilePath = path.join(analysisDir, `${imageId}_${cosmeticId}.json`);
    fs.writeFileSync(analysisFilePath, JSON.stringify(analysisResult, null, 2));

    res.json({ message: '분석 결과가 성공적으로 저장되었습니다.' });
  } catch (error) {
    res.status(500).json({ error: '분석 결과 저장 중 오류가 발생했습니다.' });
  }
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});