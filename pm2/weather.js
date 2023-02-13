const request = require("request")
const {Client} = require("pg")
const pgClient = require("../config/pgClient.js")

const data = {
    "weather": null,
    "temp": null
}
const result = {
    "success": false,
    "message": ""
}

let now = new Date()
const waitHours = 1000 * 60 * 60 * (23 - (now.getHours() + 9))
const waitMinutes = 1000 * 60 * (60 - now.getMinutes())

const updateWeatherSql = "UPDATE eodilo.city SET cityTemperature=$1 WHERE cityName=$2"
// city weather 추가

let countryValue
let cityWeatherValue
const values = [cityWeatherValue, countryValue]
const client = new Client(pgClient)

const weatherApi = (cityLat, cityLon, country) => {
    
    let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${cityLat}&lon=${cityLon}&appid=${process.env.whetherApiKeys}`

    request(weatherUrl, async (err, response, body) => {
        try {
            if (body.result == "error") {
                throw new Error("uri 오류")
            }
            const jsonResponse = JSON.parse(body)

            cityWeatherValue = parseInt(jsonResponse.main.temp - 273)
            countryValue = country

            await client.connect()
            await client.query(updateWeatherSql, values)
        } catch(err) {
            console.log(err.message)
        }
        if (client) client.end()
    })
}

const updateWeatherApi = () => {
    weatherApi(40.66, -73.93, "뉴욕") // 미국 뉴욕
    weatherApi(39.54, 116.23, "베이징") // 중국 베이징
    weatherApi(35.68, 139.69, "도쿄") // 일본 도쿄
}

setTimeout(() => {setInterval(updateWeatherApi, 1000 * 60 * 60 * 24)}, waitHours + waitMinutes)
