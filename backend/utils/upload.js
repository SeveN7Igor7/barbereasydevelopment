const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
    cb(null, file.originalname);
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
      next();
    } catch (error) {
      logger.error('Erro ao processar banner', error);
      return res.status(500).json({ error: 'Erro ao processar imagem' });
    }
  });
};





module.exports = {
  uploadLogo,
  uploadBanner,
};