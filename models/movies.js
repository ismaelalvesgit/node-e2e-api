module.exports = (sequelize, DataType) => {
  const Movies = sequelize.define("Movies", {
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataType.STRING,
      unique: {
        name: 'title_unique',
        msg: 'title must be unique',
        code: 3000
      },
      allowNull: false,
      validate: {
        notEmpty: { msg: "Oops! title cannot be empty" }
      }
    },
    status: {
      type: DataType.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Oops! status cannot be empty" }
      }
    },
    year: {
      type: DataType.INTEGER,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Oops! year cannot be empty" }
      }
    },
    release_date: {
      type: DataType.DATE,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Oops! release_date cannot be empty" }
      }
    },
    cast: {
      type: DataType.ARRAY(DataType.STRING)
    },
    overview: {
      type: DataType.STRING
    },
    cover: {
      type: DataType.STRING
    }
  });
  return Movies;
};
