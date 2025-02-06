import express from "express";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fromArrayBuffer } from "geotiff";
import bmp from "bmp-js";
import cors from "cors";
import { fileURLToPath } from "url";

// __filename과 __dirname 정의 (ES Module 환경)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

// 정적 파일 서빙 설정
app.use(express.static(path.join(__dirname, '..', 'public')));

const STATIC_DIR = path.join(__dirname, '..', 'public', 'images');

// 이미지 이름 반환 API
app.get('/images', (req, res) => {
  const filePath = path.join(__dirname, '..', 'public', 'images');
  fs.readdir(filePath, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan directory' });
    }
    const pngFileNames = files.filter((file) => file.endsWith(".png"));
    res.json(pngFileNames);
  });
});

// 이미지 삭제 API
app.delete('/images/:name', (req, res) => {
  const { name } = req.params;
  if (!name) {
    return res.status(400).json({ message: '파일 이름이 필요합니다.' });
  }

  const extensions = ['.png', '.bmp', '.tiff']; // 삭제할 확장자 목록
  const filePath = path.join(__dirname, '..', 'public', 'images');
  let deletedFiles = [];

  extensions.forEach((ext) => {
    const file = path.join(filePath, `${name}${ext}`);
    if (fs.existsSync(file)) {
      try {
        fs.unlinkSync(file);
        deletedFiles.push(`${name}${ext}`);
      } catch (err) {
        console.error(`파일 삭제 중 오류 발생: ${file}`, err.message);
      }
    }
  });

  if (deletedFiles.length > 0) {
    res.status(200).json({
      message: '파일 삭제 성공',
      deletedFiles,
    });
  } else {
    res.status(404).json({ message: '삭제할 파일을 찾을 수 없습니다.' });
  }
});

// 이미지 반환 API
app.get('/images/:name', (req, res) => {
  const imageName = req.params.name;
  const filePath = path.join(__dirname, '..', 'public', 'images', imageName);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(404).json({ error: "Image not found" });
    }
    res.setHeader('Content-Type', 'image/png'); // 이미지 타입 설정
    res.send(data);
  });
});

// 이미지 row 데이터 반환 API
app.post("/images/row-data", async (req, res) => {
  try {
    let { filename, row } = req.body;
    row = parseInt(row, 10);

    if (!filename || isNaN(row)) {
      return res.status(400).json({ error: "Invalid filename or row index" });
    }

    // 파일명과 확장자 분리
    let baseName = path.parse(filename).name;
    let ext = path.parse(filename).ext.toLowerCase();

    // PNG 요청인 경우 TIFF가 있으면 TIFF, 없으면 BMP 사용
    let filePath = path.join(STATIC_DIR, filename);
    if (ext === ".png") {
      const tiffPath = path.join(STATIC_DIR, baseName + ".tiff");
      const bmpPath = path.join(STATIC_DIR, baseName + ".bmp");
      filePath = fs.existsSync(tiffPath) ? tiffPath : bmpPath;
    }

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `File not found: ${filename}` });
    }

    let imageData; // 각 픽셀의 intensity를 담은 배열
    let width, height;

    if (filePath.endsWith(".tiff")) {
      // TIFF 파일: GeoTIFF 라이브러리 사용 (원본 비트 깊이 유지)
      const buffer = fs.readFileSync(filePath);
      const arrayBuffer = buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength
      );
      const tiff = await fromArrayBuffer(arrayBuffer);
      const image = await tiff.getImage();
      width = image.getWidth();
      height = image.getHeight();

      // 평탄화된 배열(Uint16Array 등)로 데이터를 읽음
      const rasters = await image.readRasters({ interleave: true });
      imageData = rasters;
    } else if (filePath.endsWith(".bmp")) {
      // BMP 파일: bmp-js 라이브러리 사용
      const bmpBuffer = fs.readFileSync(filePath);
      const bmpData = bmp.decode(bmpBuffer);
      width = bmpData.width;
      height = bmpData.height;
      const rgbaData = bmpData.data; // RGBA 데이터 (Uint8Array)

      // 그레이스케일 변환 (이미 그레이스케일일 수 있으나 안전하게 처리)
      imageData = new Uint8Array(width * height);
      for (let i = 0; i < width * height; i++) {
        const r = rgbaData[i * 4];
        const g = rgbaData[i * 4 + 1];
        const b = rgbaData[i * 4 + 2];
        imageData[i] = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      }
    } else {
      return res.status(400).json({ error: "Unsupported file type" });
    }

    // 행 범위 보정 (요청한 행을 중심으로 ±150)
    let startRow, endRow;
    if (row < 0) {
      startRow = 0;
      endRow = Math.min(149, height - 1);
    } else if (row >= height) {
      startRow = Math.max(0, height - 150);
      endRow = height - 1;
    } else {
      startRow = Math.max(0, row - 150);
      endRow = Math.min(height - 1, row + 149);
    }

    // 각 열별 intensity 합산
    const combinedIntensity = new Array(width).fill(0);
    for (let r = startRow; r <= endRow; r++) {
      for (let x = 0; x < width; x++) {
        combinedIntensity[x] += imageData[r * width + x];
      }
    }
    
    return res.json({ row_data: combinedIntensity });
  } catch (error) {
    console.error("Error processing image:", error);
    return res.status(500).json({ error: "Failed to process image" });
  }
});

// 화장품 데이터 저장 API
app.post('/cosmetics', (req, res) => {
  const { name, spectrum } = req.body;

  if (!name || !spectrum) {
    return res.status(400).json({ error: 'Missing name or spectrum data' });
  }

  const filePath = path.join(__dirname, '..', 'public', 'cosmetics', `${name}.json`);

  fs.writeFile(filePath, JSON.stringify(spectrum, null, 2), (err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to save cosmetic data' });
    }
    res.status(200).json({ message: 'Cosmetic data saved successfully', data: spectrum });
  });
});

// 화장품 목록 반환 API
app.get('/cosmetics', (req, res) => {
  const cosmeticsDir = path.join(__dirname, '..', 'public', 'cosmetics');
  fs.readdir(cosmeticsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan directory' });
    }
    const cosmeticsFileNames = files.filter((file) => file.endsWith(".json"));
    res.json(cosmeticsFileNames);
  });
});

// 화장품 데이터 읽기 API
app.get('/cosmetics/:name', (req, res) => {
  const cosmeticName = req.params.name;
  const cosmeticsPath = path.join(__dirname, '..', 'public', 'cosmetics', cosmeticName);
  console.log(cosmeticName);
  fs.access(cosmeticsPath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }
    fs.readFile(cosmeticsPath, 'utf8', (err, data) => {
      if (err) {
        return res.status(500).json({ error: 'Unable to read file' });
      }
      try {
        const jsonData = JSON.parse(data);
        res.json(jsonData);
      } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Invalid JSON format' });
      }
    });
  });
});

// 화장품 데이터 삭제 API
app.delete('/cosmetics/:name', (req, res) => {
  const cosmeticName = req.params.name;
  const fileExtensions = ['.json'];
  const cosmeticsDir = path.join(__dirname, '..', 'public', 'cosmetics');
  let deletedFiles = [];

  fileExtensions.forEach(ext => {
    const filePath = path.join(cosmeticsDir, cosmeticName + ext);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      deletedFiles.push(filePath);
    }
  });

  if (deletedFiles.length > 0) {
    return res.json({ message: '화장품 데이터 삭제 완료', deletedFiles });
  } else {
    return res.status(404).json({ message: '삭제할 화장품 데이터 없음' });
  }
});

// 분석 데이터 목록 반환 API
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
    });
    res.json(analyses);
  });
});

// 단일 분석 데이터 반환 API
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

// 개별 분석 수행 API
app.post('/api/individual-analysis', (req, res) => {
  const { imageId, cosmeticId } = req.body;
  const imagePath = path.join(__dirname, '..', 'public', 'images', `${imageId}.json`);
  const cosmeticPath = path.join(__dirname, '..', 'public', 'cosmetics', `${cosmeticId}.json`);

  try {
    const imageData = JSON.parse(fs.readFileSync(imagePath, 'utf8'));
    const cosmeticData = JSON.parse(fs.readFileSync(cosmeticPath, 'utf8'));

    const imageSpectrum = imageData.spectrum;
    const cosmeticSpectrum = cosmeticData.spectrum;

    // 스펙트럼 길이가 다를 경우 최소 길이로 잘라서 처리
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

// 상관계수 계산 함수
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

  if (denominator === 0) return 0;
  return numerator / denominator;
}

// 분석 결과 저장 API
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
