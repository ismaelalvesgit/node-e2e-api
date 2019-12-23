import bcrypt from "bcrypt";

module.exports = (sequelize, DataType) => {
  const Users = sequelize.define("Users", {
    id: {
      type: DataType.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    full_name: {
      type: DataType.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    password: {
      type: DataType.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataType.STRING,
      unique: {
        args: true,
        msg: 'Oops. Looks like you already have an account with this email address.',
        fields: [sequelize.fn('lower', sequelize.col('email'))]
      },
      allowNull: false,
      validate: {
        notEmpty: true,
        isEmail: {
          args: true,
          msg: 'Oops. You entered a wrong email.'
        }
      }
    },
    
  }, {
      hooks: {
        beforeCreate: user => {
          const salt = bcrypt.genSaltSync();
          user.password = bcrypt.hashSync(user.password, salt);
        },
        beforeBulkUpdate: user => {
          try {
            const salt = bcrypt.genSaltSync();
            user.attributes.password = bcrypt.hashSync(user.attributes.password, salt);
          } catch (e) {
            console.log("erro ao atualizar senha do usuário")
            console.log(e)
          }
        }
      },
      classMethods: {
        associate: models => {
          Users.hasMany(models.Movies);
        },
        isPassword: (password, encodedPassword) => {
          return bcrypt.compareSync(password, encodedPassword);
        }
      }
    });
  return Users;
};
