const bucket = require('../config/bucket.config');
const User = require('../models/user.model');
const { logger } = require('../utils/logger');

const allowedTypes = ['image/jpeg', 'image/png'];
const maxSize = 5 * 1024 * 1024;

exports.uploadProfilePicture = (req, res) => {
    const userId = req.userId; // Ambil user_id dari token
    const file = req.file; // File yang diunggah

    if (!file) {
        return res.status(400).send({
            status: "error",
            message: "No file uploaded."
        });
    }

    const filename = `profile-pictures/${userId}-${Date.now()}-${file.originalname}`;

    if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).send({
            status: "error",
            message: "Invalid file type."
        });
    }

    if (file.size > maxSize) {
        return res.status(400).send({
            status: "error",
            message: "File size exceeds limit."
        });
    }

    // Upload file ke bucket GCP
    const blob = bucket.file(filename);
    const blobStream = blob.createWriteStream({
        resumable: false
    });

    blobStream.on('error', (err) => {
        logger.error(`Error uploading file to GCP: ${err.message}`);
        return res.status(500).send({
            status: "error",
            message: "Failed to upload file."
        });
    });

    blobStream.on('finish', () => {
        // Gunakan public URL langsung
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
    
        // Update URL foto profil di database
        User.updateProfilePic(userId, publicUrl, (err, data) => {
            if (err) {
                if (err.kind === "not_found") {
                    return res.status(404).send({
                        status: "error",
                        message: "User not found."
                    });
                }
                return res.status(500).send({
                    status: "error",
                    message: "An error occurred while saving profile picture URL to database."
                });
            }
    
            res.status(200).send({
                status: "success",
                message: "Profile picture uploaded and URL saved to database.",
                data: {
                    userId: data.userId,
                    profilePic: publicUrl
                }
            });
        });
    });

    blobStream.end(file.buffer); // Mengakhiri stream dengan data file
};
