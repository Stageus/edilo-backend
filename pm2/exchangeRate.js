const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, '../.env') })
const request = require("request")
const {Client} = require("pg")
const pgClient = require("../config/pgClient.js")

let now = new Date()
const waitHours = 1000 * 60 * 60 * (23 - (now.getHours() + 9))
const waitMinutes = 1000 * 60 * (60 - now.getMinutes())
const updateExchangeRateSql = "UPDATE eodilo.city SET cityExchange=$1 WHERE cityCountry=$2"
let country
let cityExchange
const values = [cityExchange, country]
const client = new Client(pgClient)

const uri = "https://v6.exchangerate-api.com/v6/" + process.env.exchangeRateKey + "/latest/KRW"

const options = {
    uri: uri,
    json: true
}

const updateExchangeRate = request(options, async (err, res, body) => {
    try {
        if(body.result == "error") {
            throw new Error("uri 오류")
        }
        await client.connect()
        await client.query(updateExchangeRateSql, [Math.round(1/body.conversion_rates.USD), "미국"])
        await client.query(updateExchangeRateSql, [Math.round(1/body.conversion_rates.CNY), "중국"])
        await client.query(updateExchangeRateSql, [Math.round(1/body.conversion_rates.JPY), "일본"])
    } catch(err) {
        console.log(err.message)
    }
    if(client) client.end()
})

setTimeout(() => {setInterval(updateExchangeRate, 1000 * 60 * 60 * 24)}, waitHours + waitMinutes)