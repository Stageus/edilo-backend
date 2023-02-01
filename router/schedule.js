const router = require("express").Router()
const { Client } = require("pg")  
const pgClientOption = require("../config/pgClient")
const authVerify = require("../module/verify")
const weather = require("../pm2/weather")

// 일정 불러오기 api > 날씨 api 사용해서 날짜 정보 주기
router.get("/", authVerify, async (req, res) => {

    const scheduleIndex = req.query.scheduleIndex

    const result = {
        "success": false,
        "message": null,
        "scheduleData": [],
        "scheduleBlockData": []
    }

    const pgClient = null

    try {

        pgClient = new Client(pgClientOption)

        await pgClient.connect()  
        
        const sql = 'SELECT * FROM eodilo.schedule WHERE scheduleIndex=$1 UNION ALL SELECT * FROM eodilo.scheduleeBlock WHERE scheduleIndex=$2;' // 해당 스케줄 가져오기
        const values = [scheduleIndex, scheduleIndex]

        const data = await pgClient.query(sql, values)
        const row = data.rows

        if (row.length > 0) {
            result.data.push(row)
        } else {
            result.message = '일정이 존재하지 않습니다.'
        }
        result.success = true
    } catch(err) { 
        result.message = err.message
    }
    pgClient.end()
    res.send(result)
})

// 일정 업로드 api 
router.post("/", authVerify, async (req, res) => {

    const scheduleDate = req.body.scheduleDate
    const scheduleName = req.body.scheduleName
    const userId = req.decoded.userId
    const cityName = req.body.cityName

    const result = {
        "success": false,
        "message": null
    }

    const pgClient = null

    try {

        // ==================== 빈값 예외처리
        if (scheduleName == '' || scheduleName == undefined) {
            throw new Error({
                "message": "일정 제목을 입력해주세요"
            })
        }

        // ==================== 길이 예외처리
        if (scheduleName.legnth > 20) {    // 제목 길이 예외처리
            throw new Error({
                "message": "제목을 100자 이하로 입력해주세요"
            })
        }
        
        pgClient = new Client(pgClientOption)

        await pgClient.connect()
        
        const sql = 'INSERT INTO eodilo.schedule (scheduleDate, scheduleName, cityName, userId) VALUES ($1, $2, $3, $4);'
        const values = [scheduleDate, scheduleName, cityName, userId]
        
        await pgClient.query(sql, values)

        result.success = true
    } catch(err) { 
        result.message = err.message
    }
    if (pgClient) pgClient.end()
    res.send(result)
})

// 일정 수정 api 
router.put("/", authVerify, async (req, res) => {

    const scheduleIndex = req.body.scheduleIndex
    const scheduleName = req.body.scheduleName // 일정 제목 수정
    const scheduleDate = req.body.scheduleDate


    const result = {
        "success": false,
        "message": null
    }

    const pgClient = null

    try {

        // ==================== 빈값 예외처리
        if (scheduleName == '' || scheduleName == undefined) {
            throw new Error({
                "message": "일정 제목을 입력해주세요"
            })
        }

        // ==================== 길이 예외처리
        if (scheduleName.legnth > 20) {    // 제목 길이 예외처리
            throw new Error({
                "message": "일정 제목을 20자 이하로 입력해주세요"
            })
        }
        
        pgClient = new Client(pgClientOption)

        await pgClient.connect()
        
        const sql = 'UPDATE  eodilo.schedule scheduleDate=$1, scheduleName=$2 WHERE scheduleIndex=$3;'
        const values = [scheduleDate, scheduleName, scheduleIndex]
        
        await pgClient.query(sql, values)

        result.success = true
    } catch(err) { 
        result.message = err.message
    }
    if (pgClient) pgClient.end()
    res.send(result)
})

// 일정 삭제 api 일정 블록도 함께 삭제
router.delete("/", authVerify, async (req, res) => {

    const scheduleIndex = req.body.scheduleIndex
    const userId = req.decoded.userId

    const result = {
        "success": false,
        "message": ""
    }

    if (scheduleIndex == undefined) {   // 스케줄이 존재하지 않을 때 예외처리
        result.message = "일정이 존재하지 않습니다."
        return res.send(result)
    }

    const pgClient = null

    try {

        pgClient = new Client(pgClientOption)

        await pgClient.connect()
        
        const sql = 'DELETE FROM eodilo.schedule WHERE scheduleIndex=$1 AND userId=$2;' 
        const blockSql = 'DELETE FROM eodilo.scheduleBlock WHERE scheduleIndex=$1;' 

        const values = [scheduleIndex, userId]
        const blockValues = [scheduleIndex]

        await pgClient.query(sql, values)
        await pgClient.query(blockSql, blockValues)

        result.success = true
        result.message = "일정 삭제완료"
    } catch(err) { 
        result.message = err.message
    }
    pgClient.end()
    res.send(result)
})

// 일정 목록 불러오기 api > 마이페이지에서 내 일정 수, 헤더에서 내 일정 리스트
router.get("/all", authVerify, async (req, res) => {

    const userId = req.decoded.userId

    const result = {
        "success": false,
        "message": null,
        "data": []
    }

    const pgClient = null

    try {

        pgClient = new Client(pgClientOption)

        await pgClient.connect()

        const sql = 'SELECT cityName, scheduleName, scheduleDate, scheduleIndex FROM eodilo.schedule WHERE userId=$1'
        // 이럴거면 다 가져올까
        const values = [userId]

        const data = await pgClient.query(sql, values)
        const row = data.rows

        if (row.length > 0) {
            result.data.push(row)
        } else {
            result.message = '일정이 존재하지 않습니다.'
        }
        result.success = true
    } catch(err) {
        result.message = err.message
    }
    pgClient.end()
    res.send(result)
})

module.exports = router