# CekDuit - Cloud Computing

Welcome to the CekDuit Cloud Computing repository. This project is a part of Bangkit Academy 2024 Batch 2, a career-readiness program supported by Google, GoTo, Tokopedia, and Traveloka.

## Members


| Name                               | Student ID   | Role |
| ------------------------------------ | -------------- | ------ |
| Darius Mulyadi Putra               | M320B4KY1002 | ML   |
| Fransiscus Xaverius Surya Darmawan | M320B4KY1551 | ML   |
| Nathan Adhitya                     | M244B4KY3263 | ML   |
| Aristo Tely                        | C134B4KY0653 | CC   |
| Nicholas Fransisco                 | C244B4KY3356 | CC   |
| Johan Hadi Winarto                 | A389B4KY2081 | MD   |
| Aca Maulana                        | A413B4KY0055 | MD   |

## API endpoints

https://documenter.getpostman.com/view/39625331/2sAYBXAVeP

## Script yang tersedia

* `start`: Memulai server dengan node
* `start:dev`: Memulai server dengan nodemon (watch mode)
* `db:up`: Membuat database
* `tables:up`: Membuat tabel database
* `db:init`: Membuat kedua tabel dan database

## Penggunaan

Ganti nama `.env.example` menjadi `.env` dan ganti nilai variabel dengan yang benar, siapkan `service-account-key.json` di directory utama dengan permission Storage Admin, dan dapatkan CA Certificate dari Database untuk SSL.

Install dependensi yang diperlukan dengan

```sh
npm install
```

Inisialisasi database dengan

```sh
npm run db:init
```

Jalankan aplikasi dengan

```sh
npm start
atau
npm start:dev
```

## Tools

* NodeJS/Express: Server
* MySQL: Storage
* JWT: Token based authentication
* bcryptjs: Password security
* winston/morgan: Logs
* Joi: Validations

## Folder structure

```sh
.
├── README.md
├── package-lock.json
├── package.json
└── src
    ├── app.js
    ├── config
    │   ├── bucket.config.js
    │   ├── db.config.init.js
    │   └── db.config.js
    ├── controllers
    │   ├── auth.controller.js
    │   ├── gmail.controller.js
    │   ├── user.controller.js
    │   └── wallet.controller.js
    ├── database
    │   ├── queries.js
    │   └── scripts
    │       ├── dbUp.js
    │       └── tablesUp.js
    ├── index.js
    ├── middlewares
    │   ├── asyncHandler.js
    │   ├── authMiddleware.js
    │   ├── checkEmail.js
    │   ├── uploadMiddleware.js
    │   └── validatorHandler.js
    ├── models
    │   └── user.model.js
    ├── routes
    │   ├── auth.route.js
    │   ├── gmail.route.js
    │   ├── user.route.js
    │   └── wallet.route.js
    ├── utils
    │   ├── logger.js
    │   ├── password.js
    │   ├── secrets.js
    │   └── token.js
    └── validators
        └── auth.js
```
