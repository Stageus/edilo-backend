const router = require("express").Router()
const { PgClient } = require("pg")  
const pgClientOption = require("../config/pgClient")
const upload = require('../module/multer')
const authVerify = require("../module/verify")

const elastic = require("elasticsearch")

// 전체 게시글 불러오기 api 
router.get("/all", authVerify, async (req, res) => {  

    const postCategory = req.body.postCategory

    const result = {
        "success": false,
        "message": null,
        "data": []
    }

    // const userId = req.decoded.userId 

    const pgClient = new PgClient(pgClientOption)

    try {
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
        }

        if (row.length > 0) {
            result.data.push(row)
            await redisClient.disconnect()
        } else {
            result.message = '게시글이 존재하지 않습니다.'
        }
        result.success = true
        res.send(result)
    } catch(err) { 
        result.message = err.message
        res.send(result)
    }
})

// 상세 게시글 불러오기 api 댓글과 좋아요, 스크랩도 한번에 가져오기
router.get("/", authVerify, async (req, res) => {    

    const postIndex = req.query.postIndex

    const result = {
        "success": false,
        "message": null,
        "postData": [],
        "commentData": []
    }

    const pgClient = new PgClient(pgClientOption)

    try {
        await pgClient.connect() 
        
        const sql = 'SELECT * FROM eodilo.post WHERE postIndex=$1;'    
        // 코멘트 가져오는 쿼리문 n+1

        const values = [postIndex]

        const data = await pgClient.query(sql, values) // 게시글 가져오기
        
        const row = data.rows

        if (row.length > 0) {
            result.postData.push(row)
        } else {
            result.message = '해당 게시글이 존재하지 않습니다.'
        }
        result.success = true
        res.send(result)
    } catch(err) { 
        result.message = err.message
        res.send(result)
    }
})

// 게시글 작성 api 
router.post("/", authVerify, upload.single('image'), async (req, res) => {        
    
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

    // ==================== 빈값 예외처리
    if (postTitle == '' || postTitle == undefined) {    // 제목 빈값 예외처리
        result.message = "제목을 입력해주세요"
        return res.send(result)
    }
    if (postContent == '' || postContent == undefined) {    // 내용 빈값 예외처리
        result.message = "내용을 입력해주세요"
        return res.send(result)
    }
    if (postCategory == '' || postCategory == undefined) {    // 글유형 빈값 예외처리
        result.message = "글유형을 선택해주세요"
        return res.send(result)
    }
    if (cityCategory == '' || cityCategory == undefined || cityName == '' || cityName == undefined) {    // 도시 유형 빈값 예외처리
        result.message = "도시 이름 혹은 도시 유형을 선택해주세요"
        return res.send(result)
    }

    // ==================== 길이 예외처리
    if (postTitle.legnth > 100) {    // 제목 길이 예외처리
        result.message = "제목을 100자 이하로 입력해주세요"
        return res.send(result)
    }
    if (postContent.legnth > 2200) {    // 내용 길이 예외처리
        result.message = "내용을 2200자 이하로 입력해주세요"
        return res.send(result)
    }

    const pgClient = new PgClient(pgClientOption)

    try {
        await pgClient.connect()
        
        const sql = 'INSERT INTO eodilo.post (postWriter, postTitle, postContent, scheduleIndex, postCategory, cityCategory, cityName) VALUES ($1, $2, $3, $4, $5, $6, $7);'
        const values = [postWriter, postTitle, postContent, scheduleIndex, postCategory, cityCategory, cityName]
        
        await pgClient.query(sql, values)

        //// elasticsearch INSERT
        // const connect = new elastic.Client({
        //     "node": "http://localhost:9200/"
        // })  
 
        // await connect.index({   // 데이터 넣어주는 함수 
        //     "index": "board",
        //     "body": {   // 여기부터가 document
        //         "author": idValue,       // 이거 하나하나가 field
        //         "title": postTitleValue,
        //         "content": postContentValue,
        //     }
        // })

        result.success = true
        result.message = "작성 완료"
        res.send(result)
    } catch(err) { 
        result.message = err.message
        res.send(result)
    }
})

// 게시글 수정api 
router.put("/", authVerify, async (req, res) => {
    
    const postIndex = req.body.postIndex
    const postContent = req.body.postContent
    const scheduleIndex = req.body.scheduleIndex

    const result = {
        "success": false,
        "message": ""
    }

    // ==================== 빈값 예외처리 
    if (postContent == '' || postContent == undefined) {    // 내용 빈값 예외처리
        result.message = "내용을 입력해주세요"
        return res.send(result)
    }
    // ==================== 길이 예외처리 
    if (postContent.legnth > 2200) {    // 내용 길이 예외처리
        result.message = "내용을 2200자 이하로 입력해주세요"
        return res.send(result)
    }

    const pgClient = new PgClient(pgClientOption)

    try {
        await pgClient.connect()
        
        const sql = 'UPDATE eodilo.post SET postContent=$1, scheduleIndex=$2 WHERE postIndex=$3;' 
        const values = [postContent, scheduleIndex, postIndex]

        await pgClient.query(sql, values)
        
        result.success = true
        result.message = "수정 완료"
        res.send(result)
    } catch(err) { 
        result.message = err.message
        res.send(result)
    }
})

// 게시글 삭제 api 해당 댓글도 함께 삭제
router.delete("/", authVerify, async (req, res) => {    1111

    const postIndex = req.body.postIndex

    const result = {
        "success": false,
        "message": ""
    }

    if (postIndex == undefined) {   // 게시글 존재하지 않을 때 예외처리
        result.message = "게시글이 존재하지 않습니다."
        return res.send(result)
    }

    const pgClient = new PgClient(pgClientOption)

    try {
        await pgClient.connect()
        
        const sql = 'DELETE FROM eodilo.post WHERE postIndex=$1;' 
        const values = [postIndex]

        await pgClient.query(sql, values)

        result.success = true
        result.message = "삭제완료"
        res.send(result)
    } catch(err) { 
        result.message = err.message
        res.send(result)
    }
})

// 게시글 좋아요 api
router.post("/like", authVerify, async (req, res) => {    

    const postIndex = req.body.postIndex
    const userIndex = req.decoded.userIndex

    const result = {
        "success": false,
        "message": ""
    }

    const pgClient = new PgClient(pgClientOption)

    try {
        await pgClient.connect()
        
        const sql = 'INSERT INTO eodilo.like (postIndex, userIndex) VALUES ($1, $2);'
        // sql2 = 'INSERT INTO eodilo.alarm (alarmIndex, postIndex, senderNickname, userNickname, alarmDate, alarmCategory) VALUES ($1, $2, $3, $4, $5, $6);' // 알림 sql
        const values = [postIndex, userIndex]

        await pgClient.query(sql, values)

        result.success = true 
        res.send(result)
    } catch(err) { 
        result.message = err.message
        res.send(result)
    }
})

// 게시글 스크랩 api
router.post("/scrap", authVerify, async (req, res) => {    

    const postIndex = req.body.postIndex
    const userIndex = req.decoded.userIndex

    const result = {
        "success": false,
        "message": ""
    }

    const pgClient = new PgClient(pgClientOption)

    try {
        await pgClient.connect()
        
        const sql = 'INSERT INTO eodilo.scrap (postIndex, userIndex) VALUES ($1, $2);'
        // sql2 = 'INSERT INTO eodilo.alarm (alarmIndex, postIndex, senderNickname, userNickname, alarmDate, alarmCategory) VALUES ($1, $2, $3, $4, $5, $6);' // 알림 sql
        const values = [postIndex, userIndex]

        await pgClient.query(sql, values)

        result.success = true 
        res.send(result)
    } catch(err) { 
        result.message = err.message
        res.send(result)
    }
})

// 댓글 작성 api
router.post("/comment", async (req, res) => {

    const userNickname = req.decoded.userNickname
    const postIndex = req.body.postIndex
    const commentContent = req.body.commentContent
    const commentDate = req.body.commentDate

    const result = {
        "success": false,
        "message": "",
    }

    const pgClient = new PgClient(pgClientOption)

    if (commentContent == '' || commentContent == undefined) { // 빈값 예외처리
        result.message = "댓글을 작성하세요"
        return res.send(result)
    }
    if (commentContent.length > 500) {   // 길이 예외처리
        result.message = "댓글을 500자 이하로 입력해주세요"
        return res.send(result)
    }  

    try {
        await pgClient.connect()
        
        const sql = 'INSERT INTO eodilo.comment (commentContent, commentDate, userNickname, postIndex) VALUES ($1, $2, $3, $4);'
        const values = [commentContent, commentDate, userNickname, postIndex]

        await pgClient.query(sql, values)

        result.success = true
        res.send(result)
    } catch(err) { 
        result.message = err
        res.send(result)
    }

}) 

// 댓글 삭제 api
router.delete("/comment", async (req, res) => {

    const postIndex = req.body.postIndex
    const commentIndex = req.body.commentIndex

    const result = {
        "success": false,
        "message": "",
    }

    const pgClient = new PgClient(pgClientOption)

    if (commentIndex == undefined) { // undefined값 예외처리
        result.message = "댓글이 존재하지 않습니다."
        return res.send(result)
    }
    try {
        await pgClient.connect()
        
        const sql = 'DELETE FROM backend.comment WHERE commentIndex=$1;' 
        const values = [commentIndex]

        await pgClient.query(sql, values)

        result.success = true
        result.message = "삭제완료"
        res.send(result)
    } catch(err) { // 아 어차피 캐로 다 들어가니까 그냥 쭉 쓰는거네 근데 에러부분 뜨는 방식을 잘 모르겠네
        result.message = err
        res.send(result)
    }
})

module.exports = router