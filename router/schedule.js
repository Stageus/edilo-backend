<<<<<<< HEAD
const router = require("express").Router()

=======
const router = require("express").Router()
const { Client } = require("pg")  
const pgClientOption = require("../config/pgClient")
const authVerify = require("../module/verify")
const weatherApi = require("../pm2/weather")

// 일정 불러오기 api > 날씨 api 사용해서 날짜 정보 주기
router.get("/", authVerify, async (req, res) => {

    const scheduleIndex = req.query.scheduleIndex
    
    const result = {
        "success": false,
        "message": null,
        "scheduleData": [],
        "scheduleBlockData": [],
        "weatherData": null
    }

    let client = null

    try {

        client = new Client(pgClientOption)

        await client.connect()  
        
        const scheduleSql = 'SELECT * FROM eodilo.schedule WHERE scheduleIndex=$1;' // 해당 스케줄 가져오기
        const scheduleBlockSql = "SELECT * FROM eodilo.scheduleblock WHERE scheduleIndex=$1;" // 해당 스케줄 블록 가져오기

        const scheduleValues = [scheduleIndex]
        const scheduleBlockValues = [scheduleIndex]

        const scheduleData = await client.query(scheduleSql, scheduleValues)
        const scheduleBlockData = await client.query(scheduleBlockSql, scheduleBlockValues)

        const scheduleRow = scheduleData.rows
        const scheduleBlockRow = scheduleBlockData.rows

        let cityLat = scheduleRow[0].citycoordinatex
        let cityLon = scheduleRow[0].citycoordinatey
        
        result.weatherData = await weatherApi(cityLat, cityLon)

        if (scheduleRow.length > 0 && scheduleBlockRow.legnth > 0) {
            result.scheduleData.push(scheduleRow)
            result.scheduleBlockData.push(scheduleBlockRow)
        } else if (scheduleRow.length > 0){ // 스케줄 블록이 없을 때
            result.scheduleData.push(scheduleRow)            
        } else {
            result.message = '일정이 존재하지 않습니다.'
        }
        console.log(result)
        result.success = true
    } catch(err) { 
        result.message = err.message
    }
    if (client) client.end()
    res.send(result)
})

// 일정 업로드 api 
router.post("/", authVerify, async (req, res) => {

    const scheduleDate = req.body.scheduleDate
    const scheduleName = req.body.scheduleName
    const userIndex = req.decoded.userIndex
    const cityIndex = req.body.cityIndex

    const result = {
        "success": false,
        "message": null
    }

    let client = null

    try {

        // ==================== 빈값 예외처리
        if (scheduleName == '' || scheduleName == undefined) {
            throw new Error("일정 제목을 입력해주세요")
        }

        // ==================== 길이 예외처리
        if (scheduleName.legnth > 20) {    // 제목 길이 예외처리
            throw new Error("제목을 100자 이하로 입력해주세요")
        }
        
        client = new Client(pgClientOption)

        await client.connect()

        const sql = 'INSERT INTO eodilo.schedule (scheduleDate, scheduleName, cityIndex, userIndex) VALUES ($1, $2, $3, $4);'
        const values = [scheduleDate, scheduleName, cityIndex, userIndex]
        
        await client.query(sql, values)

        result.success = true
        result.message = "일정 업로드 성공"
    } catch(err) { 
        result.message = err.message
    }
    if (client) client.end()
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

    let client = null

    try {

        // ==================== 빈값 예외처리
        if (scheduleName == '' || scheduleName == undefined) {
            throw new Error("일정 제목을 입력해주세요")
        }

        // ==================== 길이 예외처리
        if (scheduleName.legnth > 20) {    // 제목 길이 예외처리
            throw new Error("일정 제목을 20자 이하로 입력해주세요")
        }
        
        client = new Client(pgClientOption)

        await client.connect()
        
        const sql = 'UPDATE  eodilo.schedule scheduleDate=$1, scheduleName=$2 WHERE scheduleIndex=$3;'
        const values = [scheduleDate, scheduleName, scheduleIndex]
        
        await client.query(sql, values)

        result.success = true
    } catch(err) { 
        result.message = err.message
    }
    if (client) client.end()
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
 
    if (scheduleIndex == undefined) { // 스케줄이 존재하지 않을 때 예외처리
        throw new Error("일정이 존재하지 않습니다.")
    }

    let client = null

    try {

        client = new Client(pgClientOption)

        await client.connect()
        
        const sql = 'DELETE FROM eodilo.schedule WHERE scheduleIndex=$1 AND userId=$2;' 
        // const blockSql = 'DELETE FROM eodilo.scheduleBlock WHERE scheduleIndex=$1;' 

        const values = [scheduleIndex, userId]
        // const blockValues = [scheduleIndex]

        client.query(sql, values)
        // client.query(blockSql, blockValues)

        result.success = true
        result.message = "일정 삭제완료"
    } catch(err) { 
        result.message = err.message
    }
    client.end()
    res.send(result)
})

// 일정 목록 불러오기 api > 마이페이지에서 내 일정 수, 헤더에서 내 일정 리스트, 게시글 작성 시 리스트 불러오기
router.get("/all", authVerify, async (req, res) => {

    const userIndex = req.decoded.userIndex

    const result = {
        "success": false,
        "message": null,
        "data": []
    }

    let client = null

    try {

        client = new Client(pgClientOption)

        await client.connect()

        const sql = 'SELECT * FROM eodilo.schedule WHERE userIndex=$1'
        
        const values = [userIndex]

        const data = await client.query(sql, values)
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
    client.end()
    res.send(result)
})

>>>>>>> 30e0d3fa4388361ad2b8fc68f95fd79f7ea06ee2
module.exports = router