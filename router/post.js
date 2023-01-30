const router = require("express").Router()
const { Client } = require("pg")
const pgClientOption = require("../config/pgClient.js")
// const imageUploader = require('../module/uploadPostImg')
const authVerify = require("../module/verify")

const elastic = require("elasticsearch")

// 전체 게시글 불러오기 api > database \"eodilodb\" does not exist
router.get("/all", authVerify, async (req, res) => {  

    const postCategory = req.body.postCategory

    const result = {
        "success": false,
        "message": null,
        "data": []
    }

    let pgClient = null

    try {
    
        pgClient = new Client(pgClientOption)
        await pgClient.connect() // await 붙여주는
        
        if (postCategory == null || postCategory == undefined) {    // 카테고리가 없을 때 (전체 게시글)
            const sql = 'SELECT * FROM eodilo.post;'

            const data = await pgClient.query(sql)
            const row = data.rows
        } else {    // 카테고리가 존재할 때
            const sql = 'SELECT * FROM eodilo.post WHERE postCategory=$1;'
            const values = [postCategory]
    
            const data = await pgClient.query(sql, values)
            const row = data.rows
        } // data랑 row부분 중복 코드로 빼려고 했는데 values를 넣는 부분이 달라서 빼지 못함 팀장님한테 한번 여쭤보자.
        
        if (row.length > 0) {
            result.data.push(row)
            await redisClient.disconnect()
        } else {
            result.message = '게시글이 존재하지 않습니다.'
        }
        result.success = true

    } catch(err) { 
        result.message = err.message
    }
    pgClient.end()
    res.send(result)
})

// 내 게시글 불러오기 
router.get("/my/all", authVerify, async (req, res) => {  

    const userIndex = req.decoded.userIndex

    const result = {
        "success": false,
        "message": null,
        "data": []
    }

    let pgClient = null

    try {
    
        pgClient = new Client(pgClientOption)
        await pgClient.connect()
        
        const sql = 'SELECT * FROM eodilo.post WHERE userIndex=$1;' // 해당 유저 게시글 select
        const values = [userIndex]

        const data = await pgClient.query(sql, values)
        const row = data.rows
        
        if (row.length > 0) {
            result.data.push(row)
            await redisClient.disconnect()
        } else {
            result.message = '게시글이 존재하지 않습니다.'
        }
        result.success = true
    } catch(err) { 
        result.message = err.message
    }
    pgClient.end()
    res.send(result)
})

// 상세 게시글 불러오기 api 댓글과 좋아요
router.get("/", authVerify, async (req, res) => {    

    const postIndex = req.query.postIndex

    const result = {
        "success": false,
        "message": null,
        "postData": [],
        "commentData": []
    }

    const pgClient = null

    try {

        pgClient = new Client(pgClientOption)

        await pgClient.connect() 
        
        const sql = 'SELECT * FROM eodilo.post WHERE postIndex=$1 UNION ALL SELECT * FROM eodilo.comment WHERE postIndex=$2;'    

        const values = [postIndex, postIndex]

        const data = await pgClient.query(sql, values) // 게시글 가져오기
        
        const row = data.rows

        if (row.length > 0) {
            result.postData.push(row)
        } else {
            result.message = '해당 게시글이 존재하지 않습니다.'
        }
        result.success = true
    } catch(err) { 
        result.message = err.message
    }
    pgClient.end()
    res.send(result)
})

// 게시글 작성 api 이미지 업로드
router.post("/", authVerify, async (req, res) => {        
    
    const postWriter = req.decoded.userNickname
    const postTitle = req.body.postTitle
    const postContent = req.body.postContent
    const scheduleIndex = req.body.scheduleIndex
    const postCategory = req.body.postCategory
    const cityName = req.body.cityName
    const cityCategory = req.body.cityCategory

    const result = {
        "success": false,
        "message": null
    }

    const pgClient = null

    try {

        // ==================== 빈값 예외처리
        if (postTitle == '' || postTitle == undefined) {    // 제목 빈값 예외처리
            throw new Error({
                "message": "제목을 입력해주세요"
            })
        }
        if (postContent == '' || postContent == undefined) {    // 내용 빈값 예외처리
            throw new Error({
                "message": "내용을 입력해주세요"
            })
        }
        if (postCategory == '' || postCategory == undefined) {    // 글유형 빈값 예외처리
            throw new Error({
                "message": "글유형을 선택해주세요"
            })
        }
        if (cityCategory == '' || cityCategory == undefined || cityName == '' || cityName == undefined) {    // 도시 유형 빈값 예외처리
            throw new Error({
                "message": "도시 이름 혹은 도시 유형을 선택해주세요"
            })
        }

        // ==================== 길이 예외처리
        if (postTitle.legnth > 100) {    // 제목 길이 예외처리
            throw new Error({
                "message": "제목을 100자 이하로 입력해주세요"
            })
        }
        if (postContent.legnth > 2200) {    // 내용 길이 예외처리
            throw new Error({
                "message": "내용을 2200자 이하로 입력해주세요"
            })
        }
        
        pgClient = new Client(pgClientOption)

        await pgClient.connect()
        
        const sql = 'INSERT INTO eodilo.post (postWriter, postTitle, postContent, scheduleIndex, postCategory, cityCategory, cityName) VALUES ($1, $2, $3, $4, $5, $6, $7);'
        const values = [postWriter, postTitle, postContent, scheduleIndex, postCategory, cityCategory, cityName]
        
        await pgClient.query(sql, values)

        result.success = true
        result.message = "작성 완료"
    } catch(err) { 
        result.message = err.message
    }
    if (pgClient) pgClient.end()
    res.send(result)
})

// 게시글 수정api 
router.put("/", authVerify, async (req, res) => {
    
    const userIndex = req.decoded.userIndex
    const postIndex = req.body.postIndex
    const postContent = req.body.postContent
    const scheduleIndex = req.body.scheduleIndex

    const result = {
        "success": false,
        "message": ""
    }

    const pgClient = null

    try {   // 관리자 페이지 같은 경우에도 throw로 받아서 예외처리

        // ==================== 빈값 예외처리
        if (postContent == '' || postContent == undefined) {    // 내용 빈값 예외처리
            throw new Error({
                "message": "내용을 입력해 주세요"
            })
        }
        // ==================== 길이 예외처리 
        if (postContent.legnth > 2200) {    // 내용 길이 예외처리
            throw new Error({
                "message": "내용을 2200자 이하로 입력해주세요"
            })
        }

        pgClient = new Client(pgClientOption)

        await pgClient.connect()
        
        const sql = 'UPDATE eodilo.post SET postContent=$1, scheduleIndex=$2 WHERE postIndex=$3 AND userIndex=$4;'  // userindex를 넣지 않으면 다른 사람의 post를 수정 삭제 할 수 있으니까 여기다가 userindex도 넣어주자
        const values = [postContent, scheduleIndex, postIndex, userIndex]

        await pgClient.query(sql, values)
        
        result.success = true
        result.message = "수정 완료"
    } catch(err) { 
        result.message = err.message
    }
    if (pgClient) pgClient.end()
    res.send(result)
})

// 게시글 삭제 api 해당 댓글도 함께 삭제, 이미지 삭제
router.delete("/", authVerify, async (req, res) => {

    const postIndex = req.body.postIndex
    const userIndex = req.decoded.userIndex

    const result = {
        "success": false,
        "message": ""
    }

    const pgClient = null

    try {

        if (postIndex == undefined) {   // 게시글 존재하지 않을 때 예외처리
            throw new Error({   
                "message": "게시글이 존재하지 않습니다."
            })
        }

        pgClient = new Client(pgClientOption)

        await pgClient.connect()
        
        const sql = 'DELETE FROM eodilo.post WHERE postIndex=$1 AND userIndex=$2;' 
        const values = [postIndex, userIndex]

        await pgClient.query(sql, values)

        result.success = true
        result.message = "게시글 삭제완료"
    } catch(err) { 
        result.message = err.message
    }
    if (pgClient) pgClient.end()
    res.send(result)
})

// 게시글 좋아요 api
router.post("/like", authVerify, async (req, res) => {    

    const postIndex = req.body.postIndex
    const userIndex = req.decoded.userIndex

    const result = {
        "success": false,
        "message": ""
    }

    const pgClient = null

    try {

        pgClient = new Client(pgClientOption)

        await pgClient.connect()
        
        const sql = 'INSERT INTO eodilo.like (postIndex, userIndex) VALUES ($1, $2);'
        // sql2 = 'INSERT INTO eodilo.alarm (alarmIndex, postIndex, senderNickname, userNickname, alarmDate, alarmCategory) VALUES ($1, $2, $3, $4, $5, $6);' // 알림 sql
        const values = [postIndex, userIndex]

        await pgClient.query(sql, values)

        result.success = true 
    } catch(err) { 
        result.message = err.message
    }
    pgClient.end()
    res.send(result)
})

// 게시글 스크랩 api
router.post("/scrap", authVerify, async (req, res) => {    

    const postIndex = req.body.postIndex
    const userIndex = req.decoded.userIndex

    const result = {
        "success": false,
        "message": ""
    }

    const pgClient = null

    try {

        pgClient = new Client(pgClientOption)

        await pgClient.connect()
        
        const sql = 'INSERT INTO eodilo.scrap (postIndex, userIndex) VALUES ($1, $2);'
        // sql2 = 'INSERT INTO eodilo.alarm (alarmIndex, postIndex, senderNickname, userNickname, alarmDate, alarmCategory) VALUES ($1, $2, $3, $4, $5, $6);' // 알림 sql
        const values = [postIndex, userIndex]

        await pgClient.query(sql, values)

        result.success = true 
    } catch(err) { 
        result.message = err.message
    }
    pgClient.end()
    res.send(result)
})

// 댓글 작성 api
router.post("/comment", authVerify, async (req, res) => {

    const userNickname = req.decoded.userNickname
    const postIndex = req.body.postIndex
    const commentContent = req.body.commentContent
    const commentDate = req.body.commentDate

    const result = {
        "success": false,
        "message": "",
    }

    const pgClient = null

    try {

        if (commentContent == '' || commentContent == undefined) { // 빈값 예외처리
            throw new Error({   
                "message": "댓글을 작성하세요"
            })
        }
        if (commentContent.length > 500) {   // 길이 예외처리
            throw new Error({   
                "message": "댓글을 500자 이하로 입력해주세요"
            })
        }  

        pgClient = new Client(pgClientOption)
        
        await pgClient.connect()
        
        const sql = 'INSERT INTO eodilo.comment (commentContent, commentDate, userNickname, postIndex) VALUES ($1, $2, $3, $4);'
        const values = [commentContent, commentDate, userNickname, postIndex]

        await pgClient.query(sql, values)

        result.success = true
    } catch(err) { 
        result.message = err
    }
    if (pgClient) pgClient.end()
    res.send(result)
}) 

// 댓글 삭제 api
router.delete("/comment", authVerify, async (req, res) => {

    const commentIndex = req.body.commentIndex
    const userNickname = req.decoded.userNickname

    const result = {
        "success": false,
        "message": "",
    }

    const pgClient = null

    try {

        if (commentIndex == undefined) { // 빈값 예외처리
            throw new Error({
                "message": "댓글이 존재하지 않습니다."
            })
        }
        
        pgClient = new Client(pgClientOption)

        await pgClient.connect()

        const sql = 'DELETE FROM eodilo.comment WHERE commentIndex=$1 AND userNickname=$2' // 해당 닉네임만 삭제할 수 있게
        const values = [commentIndex, userNickname]

        await pgClient.query(sql, values)

        result.success = true
        result.message = "댓글 삭제완료"
    } catch(err) { 
        result.message = err
    }
    if (pgClient) pgClient.end()
    res.send(result)
})

module.exports = router