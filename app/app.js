"use stricts"
const express = require("express")
const bodyParser = require('body-parser')
const cors = require("cors")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
// env variable 
require('dotenv').config()
const { BCRYPT_SALT_ROUND, BCRYPT_SECRET } = process.env 

// app express initialize
const app = express()
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json())

// jwt bcrypt
const saltRound = BCRYPT_SALT_ROUND
const secret = BCRYPT_SECRET

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
// body Parser
const jsonParser = bodyParser.json() 

// endpoint



// export this
module.exports = app;