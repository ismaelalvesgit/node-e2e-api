import http from "http";

module.exports = app => {
  if (process.env.NODE_ENV !== "test") {
    app.db.sequelize.sync().done(() => {
      http.createServer(app)
        .listen(app.get("port"), () => {
          console.log(`ZombiePlus API - Port ${app.get("port")}`);
        });
    });
  }

  String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  }
};
