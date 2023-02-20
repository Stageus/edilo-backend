const router = require("express").Router()
const { Client } = require("pg")
const pgClientOption = require("../config/pgClient.js")
const authVerify = require("../module/verify")

// 댓글 작성 api
router.post("/", authVerify, async (req, res) => {

    const userNickname = req.decoded.userNickname
    const postIndex = req.body.postIndex
    const commentContent = req.body.commentContent

    const result = {
        "success": false,
        "message": "",
    }

    let client = null

    try {

        if (commentContent == '' || commentContent == undefined) { // 빈값 예외처리
            throw new Error("댓글을 작성하세요")
        }
        if (commentContent.length > 500) {   // 길이 예외처리
            throw new Error("댓글을 500자 이하로 입력해주세요")
        }  

        client = new Client(pgClientOption)
        
        await client.connect()
        
        const sql = 'INSERT INTO eodilo.comment (commentContent, userIndex, userNickname, postIndex) VALUES ($1, $2, $3, $4);'
        // sql2 = 'INSERT INTO eodilo.alarm (alarmIndex, postIndex, senderNickname, userIndex, alarmDate, alarmCategory) VALUES ($1, $2, $3, $4, $5, $6);' // 알림 sql
        const values = [commentContent, userIndex, userNickname, postIndex]

        await client.query(sql, values)

        result.success = true
        result.message = "댓글 작성 완료"
    } catch(err) { 
        result.message = err
    }
    if (client) client.end()
    res.send(result)
}) 

// 댓글 삭제 api
router.delete("/", authVerify, async (req, res) => {

    const commentIndex = req.body.commentIndex
    const userIndex = req.decoded.userIndex

    const result = {
        "success": false,
        "message": "",
    }

    let client = null

    try {

        if (commentIndex == undefined) { // 빈값 예외처리
            throw new Error("댓글이 존재하지 않습니다.")
        }
        
        client = new Client(pgClientOption)

        await client.connect()

        const sql = 'DELETE FROM eodilo.comment WHERE commentIndex=$1 AND userIndex=$2' // 해당 닉네임만 삭제할 수 있게
        const values = [commentIndex, userIndex]

        await client.query(sql, values)

        result.success = true
        result.message = "댓글 삭제완료"
    } catch(err) { 
        result.message = err
    }
    if (client) client.end()
    res.send(result)
})

module.exports = router