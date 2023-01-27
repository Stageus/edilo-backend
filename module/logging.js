const dateTime = require("../module/date") // date
const mongoClientOption = require("./clientConfig/mongoClient") //mongodbClient
const mongoClient = require("mongodb").MongoClient

//세션에 따른 user_id값

const logging = async (user_ip, user_id, api, api_rest, req, res) => {
    const database = await mongoClient.connect(mongoClientOption, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    const data = {
        "user_ip": user_ip,
        "user_id": user_id,
        "api": api,
        "api_rest": api_rest,
        "api_time": dateTime,
        "req": req,
        "res": res
    }
    
    await database.db("eodilo").collection("logging").insertOne(data)
    database.close()
}

module.exports = logging