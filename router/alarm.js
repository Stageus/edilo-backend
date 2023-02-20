const router = require("express").Router()

const { Client } = require("pg")  
const pgClientOption = require("../config/pgClient")
const authVerify = require("../module/verify")

// 알림 불러오기 api
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
    
        const sql = 'SELECT * FROM eodilo.alarm WHERE userIndex=$1;' // 해당 닉네임의 알람 전부 select
        const values = [userIndex]

        const data = await client.query(sql, values)
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
    if (client) client.end() // pg도 끊어줘야해
    res.send(result)
})

// 알림 삭제 api
router.delete("/", authVerify, async (req, res) => {  

    const alarmIndex = req.body.alarmIndex
    const userIndex = req.decoded.userIndex

    const result = {
        "success": false,
        "message": null
    }

    let client = null
    // 무조건 에러나지 않는 코드만 try 밖에 두고 나머지는 다 try 안으로
    try {
        // 예외처리
        if (alarmIndex == undefined) {
            throw new Error("해당 알림이 없습니다")
        }

        client = new Client(pgClientOption)

        await client.connect()
 
        const sql = 'DELETE FROM eodilo.alarm WHERE alarmIndex=$1 AND userIndex=$2;'
        const values = [alarmIndex, userIndex]

        await client.query(sql, values) 

        result.success = true
        result.message = "삭제완료"
    } catch(err) { 
        result.message = err.message
    }
    if (client) client.end()    // db연결 안됐는데 종료해버릴 수도 있으니까 narrowing?
                                    // 다른 api들은 try catch안에서 에러나는 부분은 다 db 연결된 후에 에러가 나서 괜찮을 듯
    res.send(result)
})

// 알림 전체 삭제 api
router.delete("/all", authVerify, async (req, res) => {  

    const userIndex = req.decoded.userIndex

    const result = {
        "success": false,
        "message": null
    }

    let client = null

    try {

        client = new Client(pgClientOption)

        await client.connect() 
        
        const sql = 'DELETE FROM eodilo.alarm WHERE userIndex=$1;'
        const values = [userIndex]

        await client.query(sql, values)

        result.success = true
        result.message = "삭제완료"
    } catch(err) { 
        result.message = err.message
    }
    client.end()
    res.send(result)
})

module.exports = router

// alarmindex 어떻게 가져오는지
