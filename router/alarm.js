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

    const pgClient = null

    try {

        pgClient = new PgClient(pgClientOption)

        await pgClient.connect()
    
        const sql = 'SELECT * FROM eodilo.alarm WHERE userNickname=$1;' // 해당 닉네임의 알람 전부 select
        const values = [userNickname]

        const data = await pgClient.query(sql, values)
        const row = data.rows
 
        if (row.length > 0) {
            result.data.push(row)
        } else {
            result.message = '알림이 존재하지 않습니다.'
        }
        
        result.success = true
    } catch(err) { 
        result.message = err.message
    }
    pgClient.end() // pg도 끊어줘야해
    res.send(result)
})

// 알림 삭제 api
router.delete("/", authVerify, async (req, res) => {  

    const alarmIndex = req.query.alarmIndex

    const result = {
        "success": false,
        "message": null
    }

    const pgClient = null
    // 무조건 에러나지 않는 코드만 try 밖에 두고 나머지는 다 try 안으로
    try {
        // 예외처리
        if (alarmIndex == undefined) {
            throw new Error({   //  throw만나면 바로 catch 날아가는거임
                "message": "해당 알림이 없습니다"
            })
        }

        pgClient = new PgClient(pgClientOption)

        await pgClient.connect()
 
        const sql = 'DELETE FROM eodilo.alarm WHERE alarmIndex=$1;' // 해당 닉네임의 알람 전부 select
        const values = [alarmIndex]

        await pgClient.query(sql, values) 

        result.success = true
        result.message = "삭제완료"
    } catch(err) { 
        result.message = err.message
    }
    if (pgClient) pgClient.end()    // db연결 안됐는데 종료해버릴 수도 있으니까 narrowing?
                                    // 다른 api들은 try catch안에서 에러나는 부분은 다 db 연결된 후에 에러가 나서 괜찮을 듯
    res.send(result)
})

// 알림 전체 삭제 api
router.delete("/all", authVerify, async (req, res) => {  

    const userNickname = req.decoded.userNickname

    const result = {
        "success": false,
        "message": null
    }

    const pgClient = null

    try {

        pgClient = new PgClient(pgClientOption)

        await pgClient.connect() 
        
 
        const sql = 'DELETE FROM eodilo.alarm WHERE userNickname=$1;'
        const values = [userNickname]

        await pgClient.query(sql, values)

        result.success = true
        result.message = "삭제완료"
    } catch(err) { 
        result.message = err.message
    }
    pgClient.end()
    res.send(result)
})

module.exports = router

// alarmindex 어떻게 가져오는지