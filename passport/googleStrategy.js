const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const path = require("path")
require("dotenv").config({ path: path.resolve(__dirname, '../.env') })
const {Client} = require("pg")
const pgClient = require("../config/pgClient.js")

module.exports = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.googleId,
                clientSecret: process.env.googleSecret,
                callbackURL: "http://localhost:3000/auth/google/callback"
            },
            async (accessToken, refreshToken, profile, done) => {
                console.log('google profile : ', profile)
                const checkUserSql = "SELECT * FROM eodilo.account WHERE userId=$1"
                const values = [profile.id]
                let client
                try {
                    client = new Client(pgClient)
                    await client.connect()
                    const data = await client.query(checkUserSql, values)
                   if (data.rows.length > 0) {
                      done(null, data.rows[0])
                   } else {
                      done(null, newUser)
                   }
                } catch (error) {
                   console.error(error);
                   done(error);
                }
                done(null, profile)
            }
        )
    )
}