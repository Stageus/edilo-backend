const jwt = require("jsonwebtoken")

const authVerify = async (req, res, next) => {

    const result = {
        "success": false,
        "message": null,
        "authCheck": false
    }

    const authToken = req.cookies.token

    try {

        if (authToken = undefined) { // 존재하지 않는 토큰 예외
            throw new Error({
                "message": "토큰이 존재하지 않습니다."
            })
        }

        req.decoded = jwt.verify(token, process.env.jwtSecretKey)            
        return next()

    } catch {
        // 유효하지 않는 토큰 예외
        result.message = err.message
        return res.send(result)
    }
}

module.exports = authVerify