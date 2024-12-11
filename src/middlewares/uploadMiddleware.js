const multer = require('multer');
const storage = multer.memoryStorage(); // Simpan file di memori untuk diunggah langsung ke GCP
const upload = multer({ storage });

module.exports = upload;
