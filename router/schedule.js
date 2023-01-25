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

    const pgClient = new PgClient(pgClientOption)

    try {
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
        res.send(result)
    } catch(err) { 
        result.message = err.message
        res.send(result)
    }
})

// 일정 업로드 api 
router.post("/", authVerify, async (req, res) => {

    const scheduleIndex = req.body.scheduleIndex
    const scheduleDate = req.body.scheduleDate
})

module.exports = router