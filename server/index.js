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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});