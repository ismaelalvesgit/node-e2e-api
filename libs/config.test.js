module.exports = {
  database: "zombieplus",
  username: "postgres",
  password: "qaninja",
  params: {
    dialect: "postgres",
    host: "127.0.0.1",
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
