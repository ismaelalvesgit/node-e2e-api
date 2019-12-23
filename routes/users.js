import jwt from "jwt-simple";

module.exports = app => {
  const cfg = app.libs.config;
  const Users = app.db.models.Users;

  app.route("/user/:id")
    .all(app.auth.authenticate())
    /**
     * @api {get} /users/:id Read data of a User
     * @apiGroup User
     * @apiHeader {String} Content-Type header tells the client what the content type of the returned content actually is
     * @apiHeader {String} Authorization Token of authenticated user
     * @apiHeaderExample {json} Header
     *    {"Content-Type": "application/json"}
     *    {"Authorization": "JWT xyz.abc.123.hgf"}
     * @apiSuccess {Number} id User id
     * @apiSuccess {String} name User name
     * @apiSuccess {String} email User email
     * @apiSuccessExample {json} Success
     *    HTTP/1.1 200 OK
     *    {
     *      "id": 1,
     *      "name": "Alice",
     *      "email": "alice@umbrellacorp.com"
     *    }
     * @apiErrorExample {json} User not found error
     *    HTTP/1.1 404 Not Found
     * @apiErrorExample {json} Get error
     *    HTTP/1.1 412 Precondition Failed
     */
    .get((req, res) => {
      let userId = req.params.id;
      var token = req.headers.authorization;
      var decoded = jwt.decode(token.replace('JWT ', ''), cfg.jwtSecret);

      Users.findOne({
        where: {
          id: userId
        }
      })
        .then(result => {
          if (result) {
            if (result.id == decoded.id) {
              res.json(result);
            } else {
              res.sendStatus(401);
            }
          } else {
            res.sendStatus(404);
          }
        })
        .catch(error => {
          res.status(412).json({ msg: error.message });
        });
    })
    /**
     * @api {delete} /users/:id Delete a user
     * @apiGroup User
     * @apiHeader {String} Authorization Token of authenticated user
     * @apiHeaderExample {json} Header
     *    {"Authorization": "JWT xyz.abc.123.hgf"}
     * @apiSuccessExample {json} Success
     *    HTTP/1.1 204 No Content
     * @apiErrorExample {json} User not found error
     *    HTTP/1.1 404 Not Found
     * @apiErrorExample {json} Delete error
     *    HTTP/1.1 412 Precondition Failed
     */
    .delete((req, res) => {
      Users.destroy({ where: { id: req.params.id } })
        .then(result => {
          if (result === 0) {
            res.sendStatus(404)
          } else {
            res.sendStatus(204)
          }
        })
        .catch(error => {
          res.status(412).json({ msg: error.message });
        });
    })
    /**
     * @api {put} /users/:id Update a user
     * @apiGroup User
     * @apiHeader {String} Authorization Token of authenticated user
     * @apiHeaderExample {json} Header
     *    {"Authorization": "JWT xyz.abc.123.hgf"}
     * @apiParam {String} full_name User Full name
     * @apiParam {String} email User email
     * @apiParam {String} password User password
     * @apiParamExample {json} Input
     *    {
     *      "full_name": "Alice",
     *      "email": "alice@umbrellacorp.com",
     *      "password": "pwd123"
     *    }
     * @apiSuccessExample {json} Success
     *    HTTP/1.1 204 No Content
     * @apiError DuplicateEmail Email can not duplicated.
     *
     * @apiErrorExample DuplicateEmail:
     *     HTTP/1.1 409 Conflit
     *     {
     *       "msg": "Oops. Looks like you already have an account with this email address."
     *     }
     * 
     * @apiError WrongEmail Email should be valid
     * 
     * @apiErrorExample WrongEmail:
     *     HTTP/1.1 412 Precondition Failed
     *     {
     *       "msg": "Oops. You entered a wrong email."
     *     }
     * 
     * @apiError NotEmpty Name, email and password is not empty
     * 
     * @apiErrorExample NotEmpty:
     *     HTTP/1.1 412 Precondition Failed
     *     {
     *       "msg": "Validation notEmpty failed"
     *     }
     * @apiError NotNull Name, email and password is not null
     * 
     * @apiErrorExample NotNull:
     *     HTTP/1.1 412 Precondition Failed
     *     {
     *       "msg": "Field cannot be null"
     *     }
     */
    .put((req, res) => {
      Users.update(req.body, {
        where: {
          id: req.params.id
        }
      })
        .then(result => res.sendStatus(200))
        .catch(error => {
          var firstError = error.errors[0];
          var statusCode = 412;

          if (firstError.validatorKey == 'is_null') {
            statusCode = 400
          }

          if (firstError.validatorKey == 'notEmpty') {
            statusCode = 400
          }

          if (firstError.validatorKey == 'not_unique') {
            statusCode = 409
          }

          res.status(statusCode).json({ msg: firstError.message });
          // res.status(409).json({ msg: error.message });
        });
    });

  /**
   * @api {post} /user Create a new User
   * @apiGroup User
   * @apiHeader {String} Content-Type header tells the client what the content type of the returned content actually is
   * @apiHeaderExample {json} Header
   *    {"Content-Type": "application/json"}
   * @apiParam {String} full_name User Full name
   * @apiParam {String} email User email
   * @apiParam {String} password User password
   * @apiParamExample {json} Input
   *    {
   *      "full_name": "Alice",
   *      "email": "alice@umbrellacorp.com",
   *      "password": "pwd123"
   *    }
   * @apiSuccess {Number} id User id
   * @apiSuccess {String} full_name User Full name
   * @apiSuccess {String} email User email
   * @apiSuccess {String} password User encrypted password
   * @apiSuccess {Date} updated_at Update's date
   * @apiSuccess {Date} created_at Register's date
   * @apiSuccessExample {json} Success
   *    HTTP/1.1 200 OK
   *    {
   *      "id": 1,
   *      "full_name": "Alice",
   *      "email": "alice@umbrellacorp.com",
   *      "password": "$2a$10$SK1B1",
   *      "updated_at": "2016-02-10T15:20:11.700Z",
   *      "created_at": "2016-02-10T15:29:11.700Z"
   *    }
   * @apiError DuplicateEmail Email can not duplicated.
   *
   * @apiErrorExample DuplicateEmail:
   *     HTTP/1.1 409 Conflit
   *     {
   *       "msg": "Oops. Looks like you already have an account with this email address."
   *     }
   * 
   * @apiError WrongEmail Email should be valid
   * 
   * @apiErrorExample WrongEmail:
   *     HTTP/1.1 412 Precondition Failed
   *     {
   *       "msg": "Oops. You entered a wrong email."
   *     }
   * 
   * @apiError NotEmpty Name, email and password is not empty
   * 
   * @apiErrorExample NotEmpty:
   *     HTTP/1.1 412 Precondition Failed
   *     {
   *       "msg": "Validation notEmpty failed"
   *     }
   * @apiError NotNull Name, email and password is not null
   * 
   * @apiErrorExample NotNull:
   *     HTTP/1.1 412 Precondition Failed
   *     {
   *       "msg": "Field cannot be null"
   *     }
   */
  app.post("/user", (req, res) => {

    Users.create(req.body)
      .then(result => res.json(result))
      .catch(error => {
        var firstError = error.errors[0];
        var statusCode = 412;
        let result = {
          msg: firstError.message.capitalize()
        }

        if (firstError.type == 'unique violation') {
          statusCode = 409
        }

        res.status(statusCode).json(result);
      });

  });
};
