const router = require("express").Router()
const {Client} = require("pg")
const pgClient = require("../config/pgClient.js")
const authVerify = require("../module/verify.js")

router.get("/", authVerify, async (req, res) => {    //도시 정보 api
    const cityIndex = req.query.cityIndex
    const cityDetailSql = "SELECT * FROM eodilo.city WHERE cityIndex=$1"
    const values =[cityIndex]
    let client

    const result = {
        "success": false,
        "message": "",
        "data": null
    }

    try {
        if(cityIndex == undefined || cityIndex.length == 0) {
            throw new Error("잘못된 인덱스값")
        }
        client = new Client(pgClient)
        await client.connect()
        const row = await client.query(cityDetailSql, values)
        if(row.rows.length == 0) {
            throw new Error("해당 인덱스를 가진 데이터가 없음")
        }
        const data = {
            "cityName": row.rows[0].cityname,
            "cityTemperature": row.rows[0].citytemperature,
            "cityExchange": row.rows[0].cityexchange,
            "cityCoordinateXY": row.rows[0].citycoordinatexy,
            "cityTimeDiff": row.rows[0].citytimediff
        } 
        result.data = data
        result.success = true
    } catch(err) {
        result.message = err.message
    }
    if(client) client.end()
    res.send(result)
})

router.get("/search", async (req, res) => {     //지역 태그 검색 api
    const searchKeyword = req.query.searchKeyword
    const cityTagSql = "SELECT * FROM eodilo.city WHERE cityCategory LIKE $1 OR cityCountry LIKE $1 OR cityName LIKE $1"
    const values =["%" + searchKeyword + "%"]
    let client

    const result = {
        "success": false,
        "message": "",
        "cityName": null
    }

    try {
        if(searchKeyword == undefined || searchKeyword.length == 0) {
            throw new Error("잘못된 키워드값")
        }
        client = new Client(pgClient)
        await client.connect()
        const row = await client.query(cityTagSql, values)
        if(row.rows.length == 0) {
            throw new Error("해당 키워드를 가진 데이터가 없음")
        }
        let data = []
        for(var i=0; i<row.rows.length; i++) {
            data[i] = {"cityName": row.rows[i].cityname, "cityCountry": row.rows[0].citycountry}
        }
        result.cityName = data
        result.success = true
    } catch(err) {
        result.message = err.message
    }
    if(client) client.end()
    res.send(result)
})

router.get("/info", async (req, res) => {   //선택한 여행지 정보 api
    const cityIndex = req.query.cityIndex
    const cityDetailSql = "SELECT * FROM eodilo.city WHERE cityIndex=$1"
    const values =[cityIndex]
    let client

    const result = {
        "success": false,
        "message": "",
        "cityInfo": null
    }

    try {
        if(cityIndex == undefined || cityIndex.length == 0) {
            throw new Error("잘못된 인덱스값")
        }
        client = new Client(pgClient)
        await client.connect()
        const row = await client.query(cityDetailSql, values)
        if(row.rows.length == 0) {
            throw new Error("해당 인덱스를 가진 데이터가 없음")
        }
        const data = {
            "cityName": row.rows[0].cityname,
            "cityEnglishName": row.rows[0].cityenglishname,
            "cityExchange": row.rows[0].cityexchange,
            "cityFlightTime": row.rows[0].cityflighttime,
            "cityTimeDiff": row.rows[0].citytimediff,
            "cityVisa": row.rows[0].cityvisa
        } 
        result.cityInfo = data
        result.success = true
    } catch(err) {
        result.message = err.message
    }
    if(client) client.end()
    res.send(result)
})

router.get("/all", async (req, res) => {    //여행지 목록 api
    const cityKeyword = req.query.cityKeyword
    const cityTagSql = "SELECT * FROM eodilo.city"
    const values =["%" + cityKeyword + "%"]
    let client

    const result = {
        "success": false,
        "message": "",
        "cityIndex": null
    }

    try {
        // if(cityKeyword == undefined || cityKeyword.length == 0) {
        //     throw new Error("잘못된 키워드값")
        // }
        client = new Client(pgClient)
        await client.connect()
        const row = await client.query(cityTagSql)
        if(row.rows.length == 0) {
            throw new Error("해당 키워드를 가진 데이터가 없음")
        }
        let data = []
        for(var i=0; i<row.rows.length; i++) {
            data[i] = {"cityIndex": row.rows[i].cityindex, "cityName": row.rows[i].cityname, "cityEnglishName": row.rows[i].cityenglishname, 
        "cityImgUrl": row.rows[i].cityimgurl}
        }
        result.cityIndex = data
        result.success = true
    } catch(err) {
        result.message = err.message
    }
    if(client) client.end()
    res.send(result)
})

module.exports = router