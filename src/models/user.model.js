const db = require('../config/db.config');
const { createNewUser: createNewUserQuery, createUserWallet: createUserWalletQuery, findUserByEmail: findUserByEmailQuery, userProfileById: userProfileByIdQuery } = require('../database/queries');
const { logger } = require('../utils/logger');

class User {
    constructor(firstname, lastname, email, password) {
        this.firstname = firstname;
        this.lastname = lastname;
        this.email = email;
        this.password = password;
    }

    static create(newUser, cb) {
        db.query(createNewUserQuery, 
            [
                newUser.firstname, 
                newUser.lastname, 
                newUser.email, 
                newUser.password
            ], (err, res) => {
                if (err) {
                    logger.error(err.message);
                    cb(err, null);
                    return;
                }
                const userId = res.insertId;
                db.query(
                    createUserWalletQuery, 
                    [userId, 0], // Saldo awal dompet diatur ke 0
                    (err) => {
                        if (err) {
                            logger.error(`Wallet creation failed for user ID: ${userId} - ${err.message}`);
                            // Jika terjadi error, tetap kembalikan data user tanpa dompet
                            cb(null, {
                                id: userId,
                                firstname: newUser.firstname,
                                lastname: newUser.lastname,
                                email: newUser.email,
                                walletCreated: false, // Informasi tambahan bahwa wallet gagal dibuat
                            });
                            return;
                        }
    
                        // Semua berhasil, kembalikan data pengguna dengan status wallet
                        cb(null, {
                            id: userId,
                            firstname: newUser.firstname,
                            lastname: newUser.lastname,
                            email: newUser.email,
                            walletCreated: true // Informasi bahwa wallet berhasil dibuat
                        });
                    }
                );
        });
    }

    static findByEmail(email, cb) {
        db.query(findUserByEmailQuery, email, (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res[0]);
                return;
            }
            cb({ kind: "not_found" }, null);
        })
    }

    static findById(id, cb) {
        db.query(userProfileByIdQuery, [id], (err, res) => {
            if (err) {
                logger.error(err.message);
                cb(err, null);
                return;
            }
            if (res.length) {
                cb(null, res[0]); // Ambil baris pertama dari hasil
                return;
            }
            cb({ kind: "not_found" }, null);
        });
    }    

    static updateProfilePic(userId, profilePic, cb) {
        const updateProfilePicQuery = `
            UPDATE users SET profile_pic = ? WHERE id = ?
        `;
    
        db.query(updateProfilePicQuery, [profilePic, userId], (err, res) => {
            if (err) {
                logger.error(`Error updating profile picture for user ID ${userId}: ${err.message}`);
                cb(err, null);
                return;
            }
    
            if (res.affectedRows === 0) {
                cb({ kind: "not_found" }, null);
                return;
            }
    
            cb(null, {
                userId,
                profilePic,
                message: "Profile picture updated successfully."
            });
        });
    }
}

module.exports = User;