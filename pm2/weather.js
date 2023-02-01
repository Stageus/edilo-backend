const request = require("request")

const result = {
    "success": false,
    "message": "",
}
 
const weatherApi = (cityLat, cityLon) => {

    let weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${cityLat}&lon=${cityLon}&appid=${process.env.whetherApiKeys}`

    request(weatherUrl, (err, response, body) => {
        if (err) {
            result.message = "날씨를 불러올 수 없습니다."
            return res.send(result)
        } else {
            return JSON.parse(body)
        }
    })
}

module.exports = weatherApi