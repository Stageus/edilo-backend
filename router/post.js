<<<<<<< HEAD
const router = require("express").Router()

=======
const router = require("express").Router()

const { Client } = require("pg")
const pgClientOption = require("../config/pgClient.js")
const authVerify = require("../module/verify")
const imageUploader = require("../module/uploadPostImg")
const deletePostImg = require("../module/deletePostImg")

const elastic = require("elasticsearch")

// 전체 게시글 불러오기 api
router.get("/all", async (req, res) => {  

    const postCategory = req.query.postCategory
    const postPage = req.query.postPage - 1

    const result = {
        "success": false,
        "message": null,
        "data": []
    }

    let client = null

    try {
    
        client = new Client(pgClientOption)
        await client.connect() // await 붙여주는

        let row = null

        if (postPage < 0) {    // offset negative 예외처리
            throw new Error("페이지가 잘못되었습니다.")
        }
        
        if (postCategory == '' || postCategory == undefined) {    // 카테고리가 없을 때 (전체 게시글)

            const sql = `SELECT * FROM eodilo.post ORDER BY date DESC LIMIT 10 OFFSET 10*${postPage};`

            const data = await client.query(sql)
            
            row = data.rows
        
        } else {    // 카테고리가 존재할 때
                    // typeOf(category) = int
                    // 1.정보 2.리뷰 3.질문 4.여행기
            const sql = `SELECT * FROM eodilo.post WHERE postCategory=$1 ORDER BY date DESC LIMIT 10 OFFSET 10*${postPage};`
            const values = [postCategory]

            const data = await client.query(sql, values)
            row = data.rows
        } // data랑 row부분 중복 코드로 빼려고 했는데 values를 넣는 부분이 달라서 빼지 못함 팀장님한테 한번 여쭤보자.
        
        if (row.length > 0) {
            result.data.push(row)
        
        } else {
            result.message = '게시글이 존재하지 않습니다.'
        }
        result.success = true // 프론트랑 협의

    } catch(err) { 
        result.message = err.message
    }
    client.end()
    res.send(result)
})

// 게시글 검색 api
router.get("/search", authVerify, async (req, res) => {

    const postCategory = req.query.postCategory
    const searchKeyword = req.query.searchKeyword
    const postPage = req.query.postPage - 1

    const result = {
        "success": false,
        "message": "",
        "data": []
    }
    
    let client = null

    try {

        client = new Client(pgClientOption)
        await client.connect() 
        
        let row = null

        if (searchKeyword == '' || searchKeyword == undefined) {    // 검색 빈값 예외처리
            throw new Error("내용을 입력해 주세요")
        }

        if (postPage < 0) {    // offset negative 예외처리
            throw new Error("페이지가 잘못되었습니다.")
        }

        if (postCategory == '' || postCategory == undefined) {    // 카테고리가 없을 때 (전체 게시글)
            
            const sql = `SELECT * FROM eodilo.post WHERE postTitle LIKE $1 OR postContent LIKE $1 ORDER BY date DESC LIMIT 10 OFFSET 10*${postPage};`
 
            const values = [`%${searchKeyword}%`]
    
            const data = await client.query(sql, values)
    
            row = data.rows
        } else {    // 카테고리 존재할 때
            const sql = `SELECT * FROM eodilo.post WHERE postTitle LIKE $1 OR postContent LIKE $1 AND postCategory=$2 ORDER BY date DESC LIMIT 10 OFFSET 10*${postPage};`

            const values = [`%${searchKeyword}%`, postCategory]
            
            const data = await client.query(sql, values)

            row = data.rows
        }

        if (row.length > 0) {
            result.data.push(row)
        } else {
            result.message = '관련된 게시글이 존재하지 않습니다.'
        }

        result.success = true
    } catch(err) { 
        result.message = err.message
    }
    client.end()
    res.send(result)
})

// 내 게시글 불러오기 api
router.get("/my/all", authVerify, async (req, res) => {  

    const userIndex = req.decoded.userIndex
    const postPage = req.query.postPage - 1

    const result = {
        "success": false,
        "message": null,
        "data": []
    }

    let client = null

    try {
    
        client = new Client(pgClientOption)
        await client.connect()

        if (postPage < 0) {    // offset negative 예외처리
            throw new Error("페이지가 잘못되었습니다.")
        }
        
        const sql = `SELECT * FROM eodilo.post WHERE userIndex=$1 ORDER BY date DESC LIMIT 10 OFFSET 10*${postPage};` // 해당 유저 게시글 select
        const values = [userIndex]

        const data = await client.query(sql, values)
        const row = data.rows
        
        if (row.length > 0) {
            result.data.push(row)
        } else {
            result.message = '게시글이 존재하지 않습니다.'
        }
        result.success = true
    } catch(err) { 
        result.message = err.message
    }
    client.end()
    res.send(result)
})

// 상세 게시글 불러오기 api 좋아요, 스크랩 수
router.get("/", authVerify, async (req, res) => {    

    const postIndex = req.query.postIndex

    const result = {
        "success": false,
        "message": null,
        "postData": null,
        "commentData": []
    }

    let client = null

    try {

        client = new Client(pgClientOption)
        
        await client.connect() 
        
        const postSql = 'SELECT * FROM eodilo.post WHERE postIndex=$1;'    
        const commentSql = 'SELECT * FROM eodilo.comment WHERE postIndex=$1;'
        // 코멘트 셀렉트 따로 
        
        const values = [postIndex]
        
        const postData = await client.query(postSql, values) // 게시글 가져오기
        const commentData = await client.query(commentSql, values) // 댓글 가져오기
        
        const postRow = postData.rows
        const commentRow = commentData.rows
        
        if (postRow.length > 0 && commentRow.legnth > 0) {
            result.postData = postRow[0]
            result.commentData.push(commentRow)
        } else if (postRow.length > 0){ // 댓글 없을 때
            result.postData = postRow[0]
        } else {
            result.message = '해당 게시글이 존재하지 않습니다.'
        }
        
        if (result.postData != null) { // 조회수 증가
            
            const postViews = result.postData.postviews
            
            await client.query('UPDATE eodilo.post SET postViews=$1 WHERE postIndex=$2;', [postViews + 1, postIndex])
        }

        result.success = true
    } catch(err) { 
        result.message = err.message
    }
    if (client) client.end()
    res.send(result)
})

// 게시글 작성 api 이미지 업로드
router.post("/", authVerify, imageUploader.array('imgValue', 5), async (req, res) => {        
    
    const postWriter = req.decoded.userNickname
    const postTitle = req.body.postTitle
    const postContent = req.body.postContent
    const scheduleIndex = req.body.scheduleIndex
    const postCategory = req.body.postCategory
    const cityIndex = req.body.cityIndex
    const userIndex = req.decoded.userIndex
    
    let urlArr = []

    const result = {
        "success": false,
        "message": null
    }

    let client = null

    try {

        // ==================== 빈값 예외처리
        if (postTitle == '' || postTitle == undefined) {    // 제목 빈값 예외처리
            throw new Error("제목을 입력해주세요")
        }
        if (postContent == '' || postContent == undefined) {    // 내용 빈값 예외처리
            throw new Error("내용을 입력해주세요")
        }
        if (postCategory == '' || postCategory == undefined) {    // 글유형 빈값 예외처리
            throw new Error("글유형을 선택해주세요")
        }
        // if (cityCategory == '' || cityCategory == undefined || cityName == '' || cityName == undefined) {    // 도시 유형 빈값 예외처리
        //     throw new Error("도시 이름 혹은 도시 유형을 선택해주세요")
        // }

        // ==================== 길이 예외처리
        if (postTitle.legnth > 100) {    // 제목 길이 예외처리
            throw new Error("제목을 100자 이하로 입력해주세요")
        }
        if (postContent.legnth > 2200) {    // 내용 길이 예외처리
            throw new Error("내용을 2200자 이하로 입력해주세요")
        }
        
        // =================== 이미지 예외처리

        if (req.files == undefined) { // 이미지 파일 없을 때 예외처리
            throw new Error("이미지를 찾을 수 없습니다.")
        }

        for (let i = 0; i < req.files.length; i++) {
            urlArr.push(`${req.files[i].location}`)
        }
        let jsonUrl = JSON.stringify(urlArr);
        
        client = new Client(pgClientOption)
        
        await client.connect()

        // 여행기 작성일 때 (스케줄 필수)
        if (postCategory == 4) { // postcategory 4는 여행기
            if (scheduleIndex == '' || scheduleIndex == undefined) {
                throw new Error("여행기는 일정을 반드시 첨부해야 합니다.")
            }
            
            const sql = 'INSERT INTO eodilo.post (postWriter, postTitle, postContent, postCategory, cityIndex, postImgUrl, userIndex, scheduleIndex) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);'
            
            const values = [postWriter, postTitle, postContent, postCategory, cityIndex, jsonUrl, userIndex, scheduleIndex]
            
            await client.query(sql, values)
        } else {
            const sql = 'INSERT INTO eodilo.post (postWriter, postTitle, postContent, postCategory, cityIndex, postImgUrl, userIndex) VALUES ($1, $2, $3, $4, $5, $6, $7);'
            
            const values = [postWriter, postTitle, postContent, postCategory, cityIndex, jsonUrl, userIndex]
            
            await client.query(sql, values)
        }

        result.success = true
        result.message = "작성 완료"
    } catch(err) { 
        result.message = err.message
    }
    if (client) client.end()
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

    let client = null

    try {   // 관리자 페이지 같은 경우에도 throw로 받아서 예외처리

        // ==================== 빈값 예외처리
        if (postContent == '' || postContent == undefined) {    // 내용 빈값 예외처리
            throw new Error("내용을 입력해 주세요")
        }
        // ==================== 길이 예외처리 
        if (postContent.legnth > 2200) {    // 내용 길이 예외처리
            throw new Error("내용을 2200자 이하로 입력해주세요")
        }

        client = new Client(pgClientOption)

        await client.connect()
        
        // const sql = 'UPDATE eodilo.post SET postContent=$1, scheduleIndex=$2 WHERE postIndex=$3 AND userIndex=$4;'  // userindex를 넣지 않으면 다른 사람의 post를 수정 삭제 할 수 있으니까 여기다가 userindex도 넣어주자
        // const values = [postContent, scheduleIndex, postIndex, userIndex]
        const sql = 'UPDATE eodilo.post SET postContent=$1 WHERE postIndex=$2 AND userIndex=$3;'  // userindex를 넣지 않으면 다른 사람의 post를 수정 삭제 할 수 있으니까 여기다가 userindex도 넣어주자
        const values = [postContent, postIndex, userIndex]

        await client.query(sql, values)
        
        result.success = true
        result.message = "수정 완료"
    } catch(err) { 
        result.message = err.message
    }
    if (client) client.end()
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

    let client = null
    let deletePostImgUrl = null // 삭제할 이미지 url

    try {

        client = new Client(pgClientOption)

        await client.connect()

        const postSql = 'SELECT * FROM eodilo.post WHERE postIndex=$1;'    
        const postValues = [postIndex]
        const postData = await client.query(postSql, postValues) // 게시글 가져오기
        const postRow = postData.rows

        if (postRow.length > 0) {
            if (postRow[0].postimgurl != undefined || postRow[0].postimgurl != null) {
                const urlArr = JSON.parse(postRow[0].postimgurl)

                // deletePostImgUrl = urlArr[0]
                // deletePostImg(deletePostImgUrl)

                // for(let i = 0; i < urlArr.length; i++) {
                //     deletePostImgUrl = urlArr[i]
                //     console.log(deletePostImgUrl)
                //     deletePostImg(deletePostImgUrl)
                // }
            }

            const sql = 'DELETE FROM eodilo.post WHERE postIndex=$1 AND userIndex=$2;'  // ON DELETE CASCADE로 게시글 삭제하면 댓글, 좋아요, 스크랩 모두 삭제
            const values = [postIndex, userIndex]
            await client.query(sql, values)
    
            result.success = true
            result.message = "게시글 삭제완료"
        } else {
            throw new Error("게시글이 존재하지 않습니다.")  // 게시글 존재하지 않을 때 예외처리
        }
    } catch(err) { 
        result.message = err.message
    }
    if (client) client.end()
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

    let client = null

    try {

        client = new Client(pgClientOption)

        await client.connect()
        
        const likeSql = 'INSERT INTO eodilo.like (postIndex, userIndex) VALUES ($1, $2);'
        
        // const alarmSql = 'INSERT INTO eodilo.alarm (postIndex, senderNickname, userIndex, alarmCategory) VALUES ($1, $2, $3, $4);' // 알림 sql
        const likeValues = [postIndex, userIndex]
        const alarmValues = [postIndex, userIndex, postUserIndex, 1]
        // 유저 닉네임은 해당 게시글 index에서 유저 닉네임 가져와서 넣어야해 여쭤보자

        await client.query(sql, values)

        result.success = true 
    } catch(err) { 
        result.message = err.message
    }
    client.end()
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

    let client = null

    try {

        client = new Client(pgClientOption)

        await client.connect()
        
        const sql = 'INSERT INTO eodilo.scrap (postIndex, userIndex) VALUES ($1, $2);'
    
        const values = [postIndex, userIndex]

        await client.query(sql, values)

        result.success = true 
    } catch(err) { 
        result.message = err.message
    }
    client.end()
    res.send(result)
})

>>>>>>> 30e0d3fa4388361ad2b8fc68f95fd79f7ea06ee2
module.exports = router