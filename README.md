# CekDuit API
WIP

## API endpoints
1. `POST /api/auth/signup`: Sign up user baru
Body:
```js
{
    firstname: string,
    lastname: string,
    email: string,
    password: string
}
```
2. `POST /api/auth/signin`: Log in user yang sudah ter sign up
Body:
```js
{
    email: string,
    password: string
}
```
## Script yang tersedia
* `start`: Memulai server dengan node
* `start:dev`: Memulai server dengan nodemon (watch mode)
* `db:up`: Membuat database
* `tables:up`: Membuat tabel database
* `db:init`: Membuat kedua tabel dan database

## Penggunaan
Ganti nama `.env.example` menjadi `.env` dan ganti nilai variabel dengan yang benar.

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
    │   ├── db.config.init.js
    │   └── db.config.js
    ├── controllers
    │   └── auth.controller.js
    ├── database
    │   ├── queries.js
    │   └── scripts
    │       ├── dbUp.js
    │       └── tablesUp.js
    ├── index.js
    ├── middlewares
    │   ├── asyncHandler.js
    │   ├── checkEmail.js
    │   └── validatorHandler.js
    ├── models
    │   └── user.model.js
    ├── routes
    │   └── auth.route.js
    ├── utils
    │   ├── logger.js
    │   ├── password.js
    │   ├── secrets.js
    │   └── token.js
    └── validators
        └── auth.js
```