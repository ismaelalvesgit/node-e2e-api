import jwt from "jwt-simple";

import format from 'date-fns/format'
import addMinutes from 'date-fns/add_minutes'
import isPast from 'date-fns/is_past'

import bcrypt from "bcrypt";

module.exports = app => {
  const cfg = app.libs.config;
  const Users = app.db.models.Users;

  /**
   * @api {post} /auth Authentication Token
   * @apiGroup Credentials
   * @apiHeader {String} Authorization Token of authenticated user
   * @apiHeaderExample {json} Header
   *    {"Content-Type": "application/json"}
   * @apiParam {String} email User email
   * @apiParam {String} password User password
   * @apiParamExample {json} Input
   *    {
   *      "email": "alice@umbrellacorp.com",
   *      "password": "pwd123"
   *    }
   * @apiSuccess {String} token Token of authenticated user
   * @apiSuccessExample {json} Success
   *    HTTP/1.1 200 OK
   *    { 
   *      "token": "xyz.abc.123.hgf"
   *      "expire": "2019-04-25T14:50:10.808-03:00",
   *      "userId": 1
   *    }
   * @apiErrorExample {json} Authentication error
   *    HTTP/1.1 401 Unauthorized
   */
  app.post("/auth", (req, res) => {
    if (req.body.email && req.body.password) {
      const email = req.body.email;
      const password = req.body.password;

      Users.findOne({ where: { email: email } })
        .then(user => {
          if (user) {

            var passOk = bcrypt.compareSync(password, user.password)

            if (passOk) {
              let expire = format(addMinutes(new Date(), 5));
              const payload = { id: user.id, expire: expire };
              let token = jwt.encode(payload, cfg.jwtSecret);
              res.set('Authorization', token)
              res.json({ token: token, expire: expire, userId: user.id });
            } else
              res.sendStatus(401);
          } else
            res.sendStatus(401);
        })
        .catch(error => res.json({ error: error }));
    } else {
      res.sendStatus(401);
    }
  });


  app.get("/auth/refresh", (req, res) => {
    let token = req.headers.authorization.replace('Bearer ', '');
    var decoded = jwt.decode(token, cfg.jwtSecret);

    if (isPast(decoded.expire)) {
      res.sendStatus(401);
    }
    res.status(200).end();
  });

  app.get("/auth/user", (req, res) => {
    let token = req.headers.authorization.replace('Bearer ', '');
    var decoded = jwt.decode(token, cfg.jwtSecret);
    // console.log(decoded);
    Users.findByPk(decoded.id, {
      attributes: ["id", "full_name", "email"]
    })
      .then(result => res.json(result))
      .catch(error => {
        res.status(412).json({ msg: error.message });
      });
  });

};
