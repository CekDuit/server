const { Storage } = require('@google-cloud/storage');
const path = require('path');

// Path ke file JSON kunci service account
const serviceAccountKey = path.join(__dirname, '../../service-account-key.json');

// Inisialisasi Google Cloud Storage
const storage = new Storage({
    keyFilename: serviceAccountKey,
    projectId: 'cekduit', // Ganti dengan ID proyek GCP Anda
});

// Nama bucket Anda
const bucketName = 'cekduit-assets'; // Ganti dengan nama bucket Anda
const bucket = storage.bucket(bucketName);

module.exports = bucket;
