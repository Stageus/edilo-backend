const router = require("express").Router()
const {Client} = require("pg")
const pgClient = require("../config/pgClient.js")
const authVerify = require("../module/verify")
const jwt = require("jsonwebtoken")
const updateProfileImg = require("../module/updateProfileImg.js")

router.post("/login", async(req, res) => {  //로그인
    const idValue = req.body.id
    const pwValue = req.body.pw
    const loginSql = "SELECT * FROM eodilo.account WHERE userId=$1 AND userPw=$2"
    const values = [idValue, pwValue]
    const client = new Client(pgClient)

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
        const jwtToken = jwt.sign({
            "userIndex": row.userIndex,
            "userId": row.userId,
            "userEmail": row.userEmail,
            "userNickname": row.userNickname,
            "userPw": row.userPw,
            "userName": row.userName,
            "userProfileImgUrl": row.userProfileImgUrl
        },
        process.env.jwtSecretKey,
        {
            "expiresIn": "24h",
            "issuer": process.env.jwtIssuer
        })
        res.cookie("token", jwtToken)
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
    const client = new Client(pgClient)

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
    const client = new Client(pgClient)

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
    const client = new Client(pgClient)

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
    const changeNicknameSql = "UPDATE eodilo.account SET userNickname=$1 WHERE userIndex=$2"
    const values = [nicknameValue, userIndexValue]
    let client

    const result = {
        "success": false,
        "message": ""
    }

    try {
        if(userIndexValue == undefined || nicknameValue == undefined 
            || nicknameValue.length > 20 || nicknameValue.length == 0) {
            throw new Error({"message": "부적합한 인풋 값"})
        }
        client = new Client(pgClient)
        await client.connect()
        await client.query(changeNicknameSql, values)
        result.success = true
    } catch(err) {
        result.message = err.message
    }

    if(client) client.end()
    res.send(result)
})

router.put("/nickname", async (req, res) => {   //비밀번호 수정
    const userIndexValue = req.body.userIndexValue
    const pwValue = req.body.pwValue
    const pwCheckValue = req.body.pwCheckValue
    const changePwSql = "UPDATE eodilo.account SET userPw=$1 WHERE userIndex=$2"
    const values = [pwValue, userIndexValue]
    let client

    const result = {
        "success": false,
        "message": ""
    }

    try {
        if(pwValue != pwCheckValue) {
            throw new Error({"message": "비밀번호와 비밀번호 확인이 일치하지 않음"})
        }
        else if(userIndexValue == undefined || pwValue == undefined
            || pwValue.length > 20 || pwValue.length == 0) {
            throw new Error({"message": "부적합한 인풋 값"})
        }
        client = new Client(pgClient)
        await client.connect()
        await client.query(changePwSql, values)
        result.success = true
    } catch(err) {
        result.message = err.message
    }
    
    if(client) client.end()
    res.send(result)
})

router.put("/profileImg", updateProfileImg.single("imgValue"), async (req, res) => { //프로필 사진 수정

})

router.get("/", authVerify, async (req, res) => {   //프로필 정보
    
})

router.get("/logout", async (req, res) => { //로그아웃

})

router.delete("/", async (req, res) => {    //회원 탈퇴

})

module.exports = router