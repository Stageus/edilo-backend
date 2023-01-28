<<<<<<< HEAD
const router = require("express").Router()

module.exports = router
=======
const router = require("express").Router()
const { PgClient } = require("pg")  
const pgClientOption = require("../config/pgClient")
const authVerify = require("../module/verify")

// 알림 불러오기 api
router.get("/all", authVerify, async (req, res) => {  

    const userNickname = req.decoded.userNickname

    const result = {
        "success": false,
        "message": null,
        "data": []
    }

    const pgClient = new PgClient(pgClientOption)

    try {
        await pgClient.connect() // await 붙여주는
        
 
        const sql = 'SELECT * FROM eodilo.alarm WHERE userNickname=$1;' // 해당 닉네임의 알람 전부 select
        const values = [userNickname]

        const data = await pgClient.query(sql, values)
        const row = data.rows
 

        if (row.length > 0) {
            result.data.push(row)
            await redisClient.disconnect()
        } else {
            result.message = '알림이 존재하지 않습니다.'
        }
        result.success = true
        res.send(result)
    } catch(err) { 
        result.message = err.message
        res.send(result)
    }
})

// 알림 삭제 api
router.delete("/", authVerify, async (req, res) => {  

    const alarmIndex = req.query.alarmIndex

    const result = {
        "success": false,
        "message": null
    }

    const pgClient = new PgClient(pgClientOption)

    try {
        await pgClient.connect()
        
 
        const sql = 'DELETE FROM eodilo.alarm WHERE alarmIndex=$1;' // 해당 닉네임의 알람 전부 select
        const values = [alarmIndex]

        await pgClient.query(sql, values) 

        result.success = true
        result.message = "삭제완료"
        res.send(result)
    } catch(err) { 
        result.message = err.message
        res.send(result)
    }
})

// 알림 전체 삭제 api
router.delete("/all", authVerify, async (req, res) => {  

    const userNickname = req.decoded.userNickname

    const result = {
        "success": false,
        "message": null
    }

    const pgClient = new PgClient(pgClientOption)

    try {
        await pgClient.connect() 
        
 
        const sql = 'DELETE FROM eodilo.alarm WHERE userNickname=$1;'
        const values = [userNickname]

        await pgClient.query(sql, values)

        result.success = true
        result.message = "삭제완료"
        res.send(result)
    } catch(err) { 
        result.message = err.message
        res.send(result)
    }
})

module.exports = router

// alarmindex 어떻게 가져오는지
>>>>>>> 30e0d3fa4388361ad2b8fc68f95fd79f7ea06ee2
