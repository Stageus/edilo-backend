const router = require("express").Router()
const { PgClient } = require("pg")  
const pgClientOption = require("../config/pgClient")
const authVerify = require("../module/verify")

// 일정 불러오기 api
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

        pgClient = new PgClient(pgClientOption)

        await pgClient.connect()  
        
        const sql = 'SELECT * FROM eodilo.schedule WHERE scheduleIndex=$1;' // 해당 스케줄 가져오기
        // sql2 = 'SELECT * FROM eodilo.scheduleBlock WHERE scheduleIndex=$1;'
        const values = [scheduleIndex]

        const data = await pgClient.query(sql, values)
        const row = data.rows
 

        if (row.length > 0) {
            result.data.push(row)
            await redisClient.disconnect()
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

    const scheduleIndex = req.body.scheduleIndex
    const scheduleDate = req.body.scheduleDate
})

// 일정 삭제 api 일정 블록도 함께 삭제
router.delete("/", authVerify, async (req, res) => {

    const scheduleIndex = req.body.scheduleIndex

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

        pgClient = new PgClient(pgClientOption)

        await pgClient.connect()
        
        const sql = 'DELETE FROM eodilo.schedule WHERE scheduleIndex=$1;' 
        // sql2 = 'DELETE FROM eodilo.scheduleBlock WHERE scheduleIndex=$1;' 
        const values = [scheduleIndex]

        await pgClient.query(sql, values)

        result.success = true
        result.message = "일정 삭제완료"
    } catch(err) { 
        result.message = err.message
    }
    pgClient.end()
    res.send(result)
})

// 일정 목록 불러오기 api
router.get("/all", authVerify, async (req, res) => {


})

module.exports = router