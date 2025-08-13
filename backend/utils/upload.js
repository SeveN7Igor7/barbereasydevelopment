const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const logger = require('./logger');

// Configuração do storage do multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const barbeariaId = req.params.id;
    const uploadPath = path.join(__dirname, '../images', barbeariaId.toString());
    
    // Criar diretório se não existir
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
      logger.system(`Diretório criado: ${uploadPath}`);
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileType = req.route.path.includes('logo') ? 'logo' : 'banner';
    cb(null, `${fileType}${fileExtension}`);
  }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas JPEG, PNG e WebP são aceitos.'), false);
  }
};

// Configuração do multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

// Função para redimensionar imagens
const resizeImage = async (inputPath, outputPath, width, height, quality = 80) => {
  try {
    await sharp(inputPath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality })
      .toFile(outputPath);
    
    // Remover arquivo original se for diferente do redimensionado
    if (inputPath !== outputPath) {
      fs.unlinkSync(inputPath);
    }
    
    logger.info(`Imagem redimensionada: ${outputPath}`, {
      width,
      height,
      quality
    });
  } catch (error) {
    logger.error('Erro ao redimensionar imagem', error);
    throw error;
  }
};

// Middleware para upload de logo
const uploadLogo = (req, res, next) => {
  const singleUpload = upload.single('logo');
  
  singleUpload(req, res, async (err) => {
    if (err) {
      logger.error('Erro no upload de logo', err);
      return res.status(400).json({ error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    
    try {
      const inputPath = req.file.path;
      const fileExtension = path.extname(req.file.filename);
      const outputPath = path.join(path.dirname(inputPath), `logo${fileExtension}`);
      
      // Redimensionar para 1080x1080 (logo quadrada)
      await resizeImage(inputPath, outputPath, 1080, 1080, 85);
      
      // Atualizar informações do arquivo
      req.file.path = outputPath;
      req.file.filename = `logo${fileExtension}`;
      
      next();
    } catch (error) {
      logger.error('Erro ao processar logo', error);
      return res.status(500).json({ error: 'Erro ao processar imagem' });
    }
  });
};

// Middleware para upload de banner
const uploadBanner = (req, res, next) => {
  const singleUpload = upload.single('banner');
  
  singleUpload(req, res, async (err) => {
    if (err) {
      logger.error('Erro no upload de banner', err);
      return res.status(400).json({ error: err.message });
    }
    
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }
    
    try {
      const inputPath = req.file.path;
      const fileExtension = path.extname(req.file.filename);
      const outputPath = path.join(path.dirname(inputPath), `banner${fileExtension}`);
      
      // Redimensionar para proporção de banner (1920x600)
      await resizeImage(inputPath, outputPath, 1920, 600, 85);
      
      // Atualizar informações do arquivo
      req.file.path = outputPath;
      req.file.filename = `banner${fileExtension}`;
      
      next();
    } catch (error) {
      logger.error('Erro ao processar banner', error);
      return res.status(500).json({ error: 'Erro ao processar imagem' });
    }
  });
};

// Função para servir imagens
const serveImage = (imageType) => {
  return (req, res) => {
    const barbeariaId = req.params.id;
    const imagesPath = path.join(__dirname, '../images', barbeariaId.toString());
    
    // Procurar arquivo com diferentes extensões
    const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
    let imagePath = null;
    
    for (const ext of extensions) {
      const testPath = path.join(imagesPath, `${imageType}${ext}`);
      if (fs.existsSync(testPath)) {
        imagePath = testPath;
        break;
      }
    }
    
    if (!imagePath) {
      return res.status(404).json({ error: `${imageType} não encontrado` });
    }
    
    // Definir headers apropriados
    const ext = path.extname(imagePath).toLowerCase();
    let contentType = 'image/jpeg';
    
    switch (ext) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      default:
        contentType = 'image/jpeg';
    }
    
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache por 1 dia
    
    // Enviar arquivo
    res.sendFile(imagePath, (err) => {
      if (err) {
        logger.error(`Erro ao servir ${imageType}`, err);
        res.status(500).json({ error: 'Erro ao carregar imagem' });
      }
    });
  };
};

// Função para remover imagem antiga
const removeOldImage = (barbeariaId, imageType) => {
  const imagesPath = path.join(__dirname, '../images', barbeariaId.toString());
  const extensions = ['.jpg', '.jpeg', '.png', '.webp'];
  
  for (const ext of extensions) {
    const imagePath = path.join(imagesPath, `${imageType}${ext}`);
    if (fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
        logger.info(`Imagem antiga removida: ${imagePath}`);
      } catch (error) {
        logger.error('Erro ao remover imagem antiga', error);
      }
    }
  }
};

module.exports = {
  uploadLogo,
  uploadBanner,
  serveImage,
  removeOldImage
};

