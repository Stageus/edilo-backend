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
            const sql = 'SELECT * FROM edilo.post;'

            const data = await pgClient.query(sql)
            const row = data.rows
        } else {    // 카테고리가 존재할 때
            const sql = 'SELECT * FROM edilo.post WHERE postCategory=$1;'
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

// 상세 게시글 불러오기 api 
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
        
        const sql = 'SELECT * FROM edilo.post WHERE postIndex=$1;'    
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
    
    const userIndex = req.decoded.userIndex
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
        
        const sql = 'INSERT INTO edilo.post (userIndex, postTitle, postContent, scheduleIndex, postCategory, cityCategory, cityName) VALUES ($1, $2, $3, $4, $5, $6, $7);'
        const values = [userIndex, postTitle, postContent, scheduleIndex, postCategory, cityCategory, cityName]
        
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
    
    const postIndex = req.query.postIndex

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
        
        const sql = 'UPDATE edilo.post SET postContent=$1, scheduleIndex=$2 WHERE postIndex=$3;' 
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
