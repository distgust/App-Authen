"use stricts"
const express = require("express")
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const cors = require("cors")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const mysql = require("mysql")

// env variable 
require('dotenv').config()
const { BCRYPT_SALT_ROUND, BCRYPT_SECRET } = process.env

// app express initialize
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())
CORS_ALLOW_HEADERS = (
    "accept",
    "authorization",
    "content-type",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
    "ngrok-skip-browser-warning"
)


// jwt & bcrypt
const saltRound = parseInt(BCRYPT_SALT_ROUND)
const secret = BCRYPT_SECRET

// import Database Custom Module
const database = require('../modules/DB')
const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_DEV_NAME } = process.env

// pool
const pool = mysql.createPool({
    host: `${DB_HOST}`, user: `${DB_USER}`,
    port: `${DB_PORT}`, database: `${DB_DEV_NAME}`
})
const DB = new database(pool)

// endpoint
app.get('/db/test', async (req, res) => {
    try {
        let test_res = await DB.testDB()
        console.log(test_res)
        res.status(200).json({ status: "success", data: test_res })
    } catch (error) {
        console.error(error)
        res.status(201).json({ status: "error", data: error })
    }
})

app.post('/user', async (req, res) => {
    const request = req.query.request
    const { username, password } = req.body

    switch (request) {
        // add new user case
        case ('new'):
            if (password === "" || username === "") {
                res.status(400).json({ status: "error", message: "กรุณากรอกข้อมูลให้ครบ", })
            } else {
                bcrypt.hash(password, saltRound, async (err, hashed) => {
                    if (err) {
                        res.status(400).json({
                            status: "error", message: `ผิดพลาด : กรุณาลองใหม่ hash error `,
                            data: { err }
                        })
                        return
                    }

                    const userData = { user_uname: username, user_passw: hashed } // user's data for insert
                    try {
                        let insert_user = await DB.insert_data(`users_table`, userData)
                        res.status(201).json({ status: "success", message: "เพิ่มสมาชิกเรียบร้อย", data: insert_user })
                    } catch (error) { // error on user insertion progress
                        const errorCode = error.code
                        const errorNo = error.errno
                        switch (errorCode) {
                            case (`ER_DUP_ENTRY`):
                                res.status(400).json({
                                    status: "error", message: `ผิดพลาด : มี username นี้อยู่แล้ว กรุณาใช้ username อื่น`,
                                    data: { errorCode, errorNo }
                                })
                                break
                            default:
                                res.status(400).json({ status: "error", message: `ผิดพลาด : กรุณาลองใหม่`, data: error })
                                break
                        }
                    }
                })
            }
            break
        // if not matched any our request
        default:
            res.status(400).json({ status: "error", message: `ผิดพลาด : what's u wanna do?`, data: request })
            break
    }
})

app.post('/login', jsonParser, async (req, res) => {
    const { username, password } = req.body
    try {
        const data = await DB.login(username);
        // console.log(data)
        bcrypt.compare(password, data[0].user_passw, (err, logged) => {
            if (err) {
                res.status(400).json({
                    status: "error", message: "wrong password", data: err
                })
            } else {
                let loginData = { username: data[0].user_uname, role:data[0].user_role, id: data[0].user_id }
                let token = jwt.sign({
                    exp: Math.floor(Date.now() + 1000 * 60 * 60), data: loginData
                }, secret)

                res.status(200).json({
                    status: "success", message: "logged in", token: token
                })
            }
        })
    } catch (error) {
        res.status(400).json({
            status: "error", message: "User not found", data: error,
        })
    }
})

// authenticator
app.post("/auth", (req, res) => {
    try {
        const currentDate = Date.now()
        const DateNow = new Date(currentDate)
        const token = req.headers.authorization.split(" ")[1]
        let decoded = jwt.verify(token, secret)
        let exp = decoded.exp;

        if (decoded.exp < currentDate) {
            console.log(exp + "\nexpired");
        }

        console.log("<--------------   AUTHENTED   -------------->")
        console.log("<- " + DateNow + " ->")
        console.log("username : " + decoded.data.username)
        console.log("now: " + new Date(currentDate))
        console.log("expire@ : " + new Date(exp))
        console.log("<------------------------------------------->")

        res.json({ status: "ok", token: token, decode: decoded })

    } catch (err) {
        res.json({ status: "error", message: err.message })
    }
})

// export this
module.exports = app;