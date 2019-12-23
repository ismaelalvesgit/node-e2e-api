import isPast from 'date-fns/is_past'
import Sequelize from "sequelize";

module.exports = app => {
  const Movies = app.db.models.Movies;

  app.route("/movies")
    .all(app.auth.authenticate())
    /**
     * @api {get} /movies List of movies
     * @apiGroup Movies
     * @apiHeader {String} Authorization Token of authenticated user
     * @apiHeaderExample {json} Header
     *    {"Authorization": "JWT xyz.abc.123.hgf"}
     * @apiParam {String} title Movie title
     * @apiSuccess {Object[]} movies Movie's list
     * @apiSuccess {String} movies.title Movie title
     * @apiSuccess {String} movies.status Status
     * @apiSuccess {Integer} movies.year Year
     * @apiSuccess {Array} movies.cast Cast
     * @apiSuccess {String} movies.release_date Release Date
     * @apiSuccess {String} movies.cover Cover image
     * @apiSuccess {String} movies.overview Overview
     * @apiSuccessExample {json} Success
     *    HTTP/1.1 200 OK
     *    [{
     *      "id": 1,
     *      "title": "Zombieland",
     *      "year": 2009,
     *      "cast": ["Emma Stone", "Bill Murray"],
     *      "release_date": "2009-01-04",
     *      "status": "Active",
     *      "cover": "zombieland.jpg",
     *      "overview": "Two months have passed since a strain of mad cow disease mutated into (mad person disease) that became (mad zombie disease), which overran the entire United States, turning American people into vicious zombies."
     *      "updated_at": "2016-02-10T15:46:51.778Z",
     *      "created_at": "2016-02-10T15:46:51.778Z",
     *    }]
     * @apiErrorExample {json} List error
     *    HTTP/1.1 412 Precondition Failed
     */
    .get((req, res) => {

      const Op = Sequelize.Op;

      let query = {}

      if (req.query.title) {
        query.title = { [Op.iLike]: '%' + req.query.title + '%' }
      }

      // if (req.query.pre_sale) {
      //   query.pre_sale = req.query.pre_sale
      // }

      Movies.findAll({
        where: query
      })
        .then(result => res.json({ data: result }))
        .catch(error => {
          res.status(412).json({ msg: error.message });
        });
    })
    /**
     * @api {post} /movies Create a new movie
     * @apiGroup Movies
     * @apiHeader {String} Authorization Token of authenticated user
     * @apiHeaderExample {json} Header
     *    {"Authorization": "JWT xyz.abc.123.hgf"}
     * @apiParam {String} title Movie title
     * @apiParam {Integer} year Year
     * @apiParam {Array} cast Cast
     * @apiParam {String} release_date Release Date
     * @apiParam {String} status Status
     * @apiParam {String} cover Cover image
     * @apiParam {String} overview Overview
     * 
     * @apiParamExample {json} Input
     *    {
     *        "title": "Zombieland",
     *        "year": 2009,
     *        "cast": ["Emma Stone", "Bill Murray"],
     *        "release_date": "2009-01-04",
     *        "status": "Active",
     *        "cover": "zombieland.jpg",
     *        "overview": "Two months have passed since a strain of mad cow disease mutated into (mad person disease) that became (mad zombie disease), which overran the entire United States, turning American people into vicious zombies."
     *    }
     * @apiSuccess {Number} id Movie id
     * @apiSuccessExample {json} Success
     *    HTTP/1.1 200 OK
     *    {
     *      "id": 1
     *    }
     * @apiErrorExample {json} Register error
     *    HTTP/1.1 412 Precondition Failed
     * @apiErrorExample {json} Unique
     *    HTTP/1.1 409 Conflict
     *    {
     *      "msg: "title must be unique"
     *    }
     * @apiErrorExample {json} Field not Empty or Null
     *    HTTP/1.1 400 Bad Request
     *    {
     *      "msg: "Oops! title cannot be empty"
     *      "msg: "Oops! status cannot be empty"
     *      "msg: "Oops! year cannot be empty"
     *      "msg: "Oops! release_date cannot be empty"
     *    }
     */
    .post((req, res) => {
      // if (req.body.release_date) {
      //   if (isPast(req.body.release_date)) {
      //     res.status(409).json({ msg: 'release_date is past!' });
      //     return false;
      //   }
      // }

      if (req.body.cover_binary) {
        var fs = require('fs');
        var path = require('path');

        var publicPath = path.resolve('.')
        var targetPath = publicPath + '/public/images/' + req.body.cover;
        fs.writeFileSync(targetPath, req.body.cover_binary, 'binary');
        req.body.cover = req.body.cover;
      }

      Movies.create(req.body)
        .then(result => res.status(200).json({ id: result.id }))
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
          // res.status(400).json({ msg: error.message });
        });
    });

  app.route("/movies/:id")
    .all(app.auth.authenticate())
    /**
     * @api {get} /movies/:id Get a movie
     * @apiGroup Movies
     * @apiHeader {String} Authorization Token of authenticated user
     * @apiHeaderExample {json} Header
     *    {"Authorization": "JWT xyz.abc.123.hgf"}
     * @apiParam {id} id Movie id
     * @apiSuccessExample {json} Success
     *    HTTP/1.1 200 OK
     *    {
     *      "id": 1,
     *      "title": "Zombieland",
     *      "year": 2009,
     *      "cast": ["Emma Stone", "Bill Murray"],
     *      "release_date": "2009-01-04",
     *      "status": "Active",
     *      "cover": "zombieland.jpg",
     *      "overview": "Two months have passed since a strain of mad cow disease mutated into (mad person disease) that became (mad zombie disease), which overran the entire United States, turning American people into vicious zombies."
     *      "updated_at": "2016-02-10T15:46:51.778Z",
     *      "created_at": "2016-02-10T15:46:51.778Z",
     *    }
     * @apiErrorExample {json} Movie not found error
     *    HTTP/1.1 404 Not Found
     * @apiErrorExample {json} Find error
     *    HTTP/1.1 412 Precondition Failed
     */
    .get((req, res) => {
      Movies.findOne({
        where: {
          id: req.params.id
        }
      })
        .then(result => {
          if (result) {
            res.json(result);
          } else {
            res.sendStatus(404);
          }
        })
        .catch(error => {
          res.status(412).json({ msg: error.message });
        });
    })
    /**
     * @api {put} /movies/:id Update a movie
     * @apiGroup Movies
     * @apiHeader {String} Authorization Token of authenticated user
     * @apiHeaderExample {json} Header
     *    {"Authorization": "JWT xyz.abc.123.hgf"}
     * @apiParam {String} title Movie title
     * @apiParam {Integer} year Year
     * @apiParam {Array} cast Cast
     * @apiParam {String} release_date Release Date
     * @apiParam {String} status Status
     * @apiParam {String} cover Cover image
     * @apiParam {String} overview Overview
     * 
     * @apiParamExample {json} Input
     *    {
     *      "title": "Zombieland",
     *      "year": 2009,
     *      "cast": ["Emma Stone", "Bill Murray"],
     *      "release_date": "2009-01-04",
     *      "status": "Active",
     *      "cover": "zombieland.jpg",
     *      "overview": "Two months have passed since a strain of mad cow disease mutated into (mad person disease) that became (mad zombie disease), which overran the entire United States, turning American people into vicious zombies."
     *    }
     * @apiSuccessExample {json} Success
     *    HTTP/1.1 204 No Content
     * @apiErrorExample {json} Register error
     *    HTTP/1.1 412 Precondition Failed
     * @apiErrorExample {json} Unique
     *    HTTP/1.1 409 Conflict
     *    {
     *      "msg: "title must be unique"
     *    }
     * @apiErrorExample {json} Field not Empty or Null
     *    HTTP/1.1 400 Bad Request
     *    {
     *      "msg: "Oops! title cannot be empty"
     *      "msg: "Oops! status cannot be empty"
     *      "msg: "Oops! year cannot be empty"
     *      "msg: "Oops! release_date cannot be empty"
     *    }
     */
    .put((req, res) => {

      // if (isPast(req.body.release_date)) {
      //   res.status(409).json({ code: 2001 ,msg: 'Due date is past!' });
      //   return false;
      // }

      Movies.update(req.body, {
        where: {
          id: req.params.id
        }
      })
        .then(result => res.sendStatus(204))
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
    })
    /**
     * @api {delete} /movies/:id Remove a movie
     * @apiGroup Movies
     * @apiHeader {String} Authorization Token of authenticated user
     * @apiHeaderExample {json} Header
     *    {"Authorization": "JWT xyz.abc.123.hgf"}
     * @apiParam {id} id Movie id
     * @apiSuccessExample {json} Success
     *    HTTP/1.1 204 No Content
     * @apiErrorExample {json} Movie not found error
     *    HTTP/1.1 404 Not Found
     * @apiErrorExample {json} Find error
     *    HTTP/1.1 412 Precondition Failed
     */
    .delete((req, res) => {
      Movies.destroy({
        where: {
          id: req.params.id
        }
      })
        .then(result => res.sendStatus(204))
        .catch(error => {
          res.status(412).json({ msg: error.message });
        });
    });
};
