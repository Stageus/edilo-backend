const pgClientOption = {
    user: process.env.pgUser,
    password: process.env.pgPassword,
    host: process.env.pgHost,
    database: process.env.pgDb,
    port: pgPort
}

module.exports = pgClientOption