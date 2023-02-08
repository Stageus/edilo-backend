const kakao = {
    clientID: process.env.kakaoClientIdKey,
    clientSecret: process.env.kakaoClientSecretCode,
    redirectUri: 'http://localhost:3000/auth/kakao/callback'
}

module.exports = kakao