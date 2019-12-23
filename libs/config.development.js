import logger from "./logger.js";

module.exports = {
  database: process.env.DATABASE_NAME || "zombieplus",
  username: process.env.DATABASE_USER || "postgres",
  password: process.env.DATABASE_PASS || "postgres",
  params: {
    dialect: "postgres",
    host: process.env.DATABASE_URL || "127.0.0.0",
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
