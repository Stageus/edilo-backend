const router = require("express").Router()
const { Client } = require("pg")  
const pgClientOption = require("../config/pgClient")
const authVerify = require("../module/verify")
const weatherApi = require("../pm2/weather")

// 일정 불러오기 api
router.get("/", authVerify, async (req, res) => {

    const scheduleIndex = req.query.scheduleIndex
    
    const result = {
        "success": false,
        "message": null,
        "scheduleData": null,
        "scheduleBlockData": [],
        "weatherData": null
    }

    let client = null

    try {

        client = new Client(pgClientOption)

        await client.connect()  
        
        const scheduleSql = 'SELECT * FROM eodilo.schedule WHERE scheduleIndex=$1;' // 해당 스케줄 가져오기
        const scheduleBlockSql = "SELECT * FROM eodilo.scheduleblock WHERE scheduleIndex=$1 ORDER BY blockOrder ASC;" // 해당 스케줄 블록 가져오기

        const scheduleValues = [scheduleIndex]
        const scheduleBlockValues = [scheduleIndex]

        const scheduleData = await client.query(scheduleSql, scheduleValues)
        const scheduleBlockData = await client.query(scheduleBlockSql, scheduleBlockValues)

        const scheduleRow = scheduleData.rows
        const scheduleBlockRow = scheduleBlockData.rows

        if (scheduleRow.length > 0 && scheduleBlockRow.legnth > 0) {
            result.scheduleData = scheduleRow[0]
            result.scheduleBlockData.push(scheduleBlockRow)

            // 날씨정보
            const cityIndex = scheduleRow[0].cityindex
            const weatherSql = "SELECT cityTemperature FROM eodilo.city WHERE scheduleIndex=$1;" // 해당 스케줄 날씨 가져오기 city 인덱스 넣기
            const weatherValues = [cityIndex]

            const weatherData = await client.query(weatherSql, weatherValues)

            const weatherRow = weatherData.rows

            result.weatherData.push(weatherRow[0])

        } else if (scheduleRow.length > 0){ // 스케줄 블록이 없을 때
            result.scheduleData = scheduleRow[0]

            // 날씨정보
            const cityIndex = scheduleRow[0].cityindex
            const weatherSql = "SELECT cityTemperature FROM eodilo.city WHERE scheduleIndex=$1;" // 해당 스케줄 날씨 가져오기 city 인덱스 넣기
            const weatherValues = [cityIndex]

            const weatherData = await client.query(weatherSql, weatherValues)

            const weatherRow = weatherData.rows

            result.weatherData.push(weatherRow[0])
        } else {
            result.message = '일정이 존재하지 않습니다.'
        }
        result.success = true
    } catch(err) { 
        result.message = err.message
    }
    if (client) client.end()
    res.send(result)
})

// 일정 업로드 api 처음 저장버튼 누를 때 생성 아 이걸 어떻게 해야하지 진짜 1. 처음 넣을때 스케줄index없음 2.스케줄블록 insert와 update 차이
router.post("/", authVerify, async (req, res) => {

    const scheduleDate = req.body.scheduleDate
    const scheduleName = req.body.scheduleName
    const userIndex = req.decoded.userIndex
    const cityIndex = req.body.cityIndex
    const cityCategory = req.body.cityCategory
    const cityCountry = req.body.cityCountry
    const cityName = req.body.cityName
    
    let scheduleBlockList = req.body.scheduleBlockList

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
        if (scheduleDate == '' || scheduleDate == undefined) {
            throw new Error("일정 날짜를 선택해주세요")
        }
        
        // ==================== 길이 예외처리
        if (scheduleName.legnth > 20) {    // 제목 길이 예외처리
            throw new Error("제목을 100자 이하로 입력해주세요")
        }
        
        client = new Client(pgClientOption)

        await client.connect()

        // 인덱스 있으면 스케줄 업데이트, 스케줄블록은 업데이트나 인서트, 프론트에서 받은 값중에 존재하지 않는 스케줄 블록 인덱스가 있다면 딜리트
        const sql = 'INSERT INTO eodilo.schedule (scheduleDate, scheduleName, cityIndex, userIndex, cityCategory, cityCountry, cityName) VALUES ($1, $2, $3, $4, $5, $6, %7) RETURNING scheduleIndex;'
        const values = [scheduleDate, scheduleName, cityIndex, userIndex, cityCategory, cityCountry, cityName]
        
        const ScheduleIndexData = await client.query(sql, values)

        const ScheduleIndex = ScheduleIndexData.rows

        if (scheduleBlockList != undefined) { 
            for (let i = 0; i < scheduleBlockList.length; i++) { // 블록 개수만큼

                let blockSql = 'INSERT INTO eodilo.scheduleblock (blockOrder, blockName, blockCategory, blockTime, blockcost, scheduleIndex, blockcoordinatex, blockcoordinatey) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);'

                let blockValues = [scheduleBlockList[i].blockOrder, scheduleBlockList[i].blockName, scheduleBlockList[i].blockCategory, scheduleBlockList[i].blockTime, scheduleBlockList[i].blockcost, ScheduleIndex[0].scheduleindex, scheduleBlockList[i].blockcoordinatex, scheduleBlockList[i].blockcoordinatey]                

                await client.query(blockSql, blockValues)
            }
        }

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
    const userIndex = req.decoded.userIndex

    let scheduleBlockList = req.body.scheduleBlockList

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
        // 스케줄 수정
        const sql = 'UPDATE eodilo.schedule SET scheduleDate=$1, scheduleName=$2 WHERE scheduleIndex=$3 AND userIndex=$4;'
        const values = [scheduleDate, scheduleName, scheduleIndex, userIndex]

        // 기존 블록 삭제
        await client.query('DELETE FROM eodilo.scheduleblock WHERE scheduleIndex=$1;', [scheduleIndex])

        // 블록 추가
        if (scheduleBlockList != undefined) { 
            for (let i = 0; i < scheduleBlockList.length; i++) { // 블록 개수만큼

                let blockSql = 'INSERT INTO eodilo.scheduleblock (blockOrder, blockName, blockCategory, blockTime, blockcost, scheduleIndex, blockcoordinatex, blockcoordinatey) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);'

                let blockValues = [scheduleBlockList[i].blockOrder, scheduleBlockList[i].blockName, scheduleBlockList[i].blockCategory, scheduleBlockList[i].blockTime, scheduleBlockList[i].blockcost, scheduleIndex, scheduleBlockList[i].blockcoordinatex, scheduleBlockList[i].blockcoordinatey]                

                await client.query(blockSql, blockValues)
            }
        }

        // // 삭제된 블록 
        // const deleteBlockData = await client.query('SELECT blockIndex FROM eodilo.scheduleblock WHERE scheduleIndex=$1;', [scheduleIndex])
        // const deleteBlockRow = deleteBlockData.rows
        
        // 스케줄 블록 수정
        // if (scheduleBlockList != undefined) { 
        //     for (let i = 0; i < scheduleBlockList.length; i++) { // 블록 개수만큼
        //         let blockSql
        //         let blockValues
        //         if (scheduleBlockList[i].blockIndex) { // 기존에 있던 블록
        //             if (deleteBlockRow != undefined && deleteBlockRow != null) {
        //                 for (let index = 0; index < deleteBlockRow.length; index++) {
        //                     if (deleteBlockRow[index].blockindex == scheduleBlockList[i].blockIndex) {
        //                         deleteBlockRow.splice(index, 1)
        //                         break
        //                     }
        //                 }
        //                 for (let index = 0; index < deleteBlockRow.length; index++) {
        //                     await client.query('DELETE FROM eodilo.scheduleblock WHERE blockindex=$1', [deleteBlockRow[index].blockindex])
        //                 }
        //             }
        //             blockSql = 'UPDATE eodilo.scheduleblock SET blockOrder=$1, blockName=$2, blockCategory=$3, blockTime=$4, blockcost=$5, blockcoordinatex=$6, blockcoordinatey=$7 WHERE blockIndex=$8'
        //             blockValues = [scheduleBlockList[i].blockOrder, scheduleBlockList[i].blockName, scheduleBlockList[i].blockCategory, scheduleBlockList[i].blockTime, scheduleBlockList[i].blockcost, scheduleBlockList[i].blockcoordinatex, scheduleBlockList[i].blockcoordinatey, scheduleBlockList[i].blockIndex]
        //         } else { // 기존에 없던 블록
        //             blockSql = 'INSERT INTO eodilo.scheduleblock (blockOrder, blockName, blockCategory, blockTime, blockcost, scheduleIndex, blockcoordinatex, blockcoordinatey) VALUES ($1, $2, $3, $4, $5, $6, $7, $8);'
        //             blockValues = [scheduleBlockList[i].blockOrder, scheduleBlockList[i].blockName, scheduleBlockList[i].blockCategory, scheduleBlockList[i].blockTime, scheduleBlockList[i].blockcost, scheduleIndex, scheduleBlockList[i].blockcoordinatex, scheduleBlockList[i].blockcoordinatey]       
        //         }
        
        //         await client.query(blockSql, blockValues)
        //     }
        // }
        
        await client.query(sql, values)
        result.success = true
        result.message = "수정 완료"
    } catch(err) { 
        result.message = err.message
    }
    if (client) client.end()
    res.send(result)
})

// 일정 삭제 api 일정 블록도 함께 삭제
router.delete("/", authVerify, async (req, res) => {

    const scheduleIndex = req.body.scheduleIndex
    const userIndex = req.decoded.userIndex

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
        
        const sql = 'DELETE FROM eodilo.schedule WHERE scheduleIndex=$1 AND userIndex=$2;' 
        // const blockSql = 'DELETE FROM eodilo.scheduleBlock WHERE scheduleIndex=$1;' 

        const values = [scheduleIndex, userIndex]
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

module.exports = router