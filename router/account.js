const router = require("express").Router()
const {Client} = require("pg")
const pgConn = require("../config/pgConn.js")

router.post("/login", async(req, res) => {  //로그인
    const idValue = req.body.id
    const pwValue = req.body.pw
    const loginSql = "SELECT * FROM eodilo.account WHERE userId=$1 AND userPw=$2"
    const values = [idValue, pwValue]
    const client = new Client(pgConn)

    const result = {
        "success": false,
        "message": ""
    }

    if(idValue.length == 0 || idValue.length > 20 || pwValue.length == 0 || pwValue.length > 20) {
        result.message = "아이디 또는 비밀번호의 길이 부적합"
        res.send(result)
        return
    }

    try {
        await client.connect()
        const data = await client.query(loginSql, values)
        const row = data.rows
        if(row.length != 0) {
            result.success = true
        }
        res.send(result)
    } catch(err) {
        result.message = err.message
        res.send(result)
    }
})

router.post("/", async (req, res) => {  //회원가입
    const emailValue = req.body.emailValue
    const idValue = req.body.idValue
    const pwValue = req.body.pwValue
    const nameValue = req.body.nameValue
    const nicknameValue = req.body.nicknameValue
    const signupSql = "INSERT INTO eodilo.account (userEmail, userId, userPw, userName, userNickname) VALUES($1, $2, $3, $4, $5)"
    const values = [emailValue, idValue, pwValue, nameValue, nicknameValue]
    const client = new Client(pgConn)

    const result = {
        "success": false,
        "message": ""
    }

    if(emailValue.length == 0 || idValue.length > 320 || idValue.length == 0 || idValue.length > 20 
    || pwValue.length == 0 || pwValue.length > 20 || nameValue.length == 0 || nameValue.length > 20
    || nicknameValue.length == 0 || nicknameValue.length > 20) {
        result.message = "입력한 회원정보의 길이 부적합"
        res.send(result)
        return
    }

    try {
        await client.connect()
        await client.query(signupSql, values)
        result.success = true
        res.send(result)
    } catch(err) {
        result.message = err.message
        res.send(result)
    }
})

router.post("/nickname/confirm", async (req, res) => {  //닉네임 중복확인
    const nicknameValue = req.body.nicknameValue
    const nicknameCheckSql = "SELECT * FROM eodilo.account WHERE userNickname=$1"
    const values = [nicknameValue]
    const client = new Client(pgConn)

    const result = {
        "success": false,
        "message": ""
    }

    if(nicknameValue.length > 20 || nicknameValue.length == 0) {
        result.message = "입력의 길이 부적합"
        res.send(result)
        return
    }

    try{
        await client.connect()
        const data = await client.query(nicknameCheckSql, values)
        const row = data.rows
        if(row.length == 0) {
            result.success = true
        }
        res.send(result)
    } catch(err) {
        result.message = err.message
        res.send(result)
    }
})

router.post("/id/confirm", async (req, res) => {  //아이디 중복확인
    const idValue = req.body.idValue
    const idCheckSql = "SELECT * FROM eodilo.account WHERE userId=$1"
    const values = [idValue]
    const client = new Client(pgConn)

    const result = {
        "success": false,
        "message": ""
    }

    if(idValue.length > 20 || idValue.length == 0) {
        result.message = "입력의 길이 부적합"
        res.send(result)
        return
    }

    try{
        await client.connect()
        const data = await client.query(idCheckSql, values)
        const row = data.rows
        if(row.length == 0) {
            result.success = true
        }
        res.send(result)
    } catch(err) {
        result.message = err.message
        res.send(result)
    }
})

router.put("/nickname", async (req, res) => {   //닉네임 수정
    const userIndexValue = req.body.userIndexValue
    const nicknameValue = req.body.nicknameValue
    const changeNicknameSql = "SELECT * FROM eodilo.account WHERE userId=$1"
    const values = [userIndexValue, nicknameValue]
    const client = new Client(pgConn)
})
module.exports = router