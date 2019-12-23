module.exports = {
  database: "d7fleer2p8qr2i",
  username: "bqyjrdjwsngpxk",
  password: "772d975fda74f3eacfb7d31dd9dea6d28781cb764bbbb11436cf2d3411dba92a",
  params: {
    dialect: "postgres",
    host: process.env.DATABASE || "127.0.0.1",
    port: 5432,
    logging: (sql) => {
      logger.info(`[${new Date()}] ${sql}`);
    },
    define: {
      underscored: true
    }
  },
  jwtSecret: "ZombiePlus",
  jwtSession: {session: false}
};