"use stricts"
const express = require("express")
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
const cors = require("cors")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const mysql = require("mysql2")

// you need to create .env before run this
// env variable 
require('dotenv').config()
const {
    BCRYPT_SALT_ROUND, JWT_SECRET,
    DB_HOST, DB_PORT, DB_USER,
    DB_PASS, DB_NAME
} = process.env

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
const jwtSecret = JWT_SECRET

// import Database Custom Module
const database = require('../modules/DB')
// create pool
const pool = mysql.createPool({
    host: `${DB_HOST}`, user: `${DB_USER}`, password: `${DB_PASS}`,
    port: `${DB_PORT}`, database: `${DB_NAME}`
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

app.post('/api/user', async (req, res) => { // create new user 
    try {

        const { username, password } = req.body
        if (!username || !password) {
            res.status(400).json({ status: "success", message: "Username or password is missing." })
            return
        }
        if (username == undefined || password == undefined) {
            res.status(400).json({ status: "success", message: "Username or password is missing." })
            return
        }

        const hashed = await bcrypt.hash(password, saltRound)
        const data = { user_uname: username, user_passw: hashed }
        try {
            const createUser = await DB.new_user(data)
            res.status(201).json({ status: "success", data: createUser })
            return
        } catch (error) {
            // console.error(error)
            res.status(400).json({ status: "error", data: error, message: "can not create this user" })
            return
        }
    } catch (error) {
        // console.error(error)
        res.status(500).json({ status: "error", message: "hashed error", data: error })
        return
    }
})

// export this
module.exports = app;