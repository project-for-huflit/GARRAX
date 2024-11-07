'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Account extends Model {
    static associate(models) {
      Account.hasOne(models.CustomerDetails, {
        foreignKey: 'IDAcc',
        onDelete: 'CASCADE',
      });
    }
  }

  Account.init({
    IDAcc: { 
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    Role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'user',  // Thêm giá trị mặc định ở đây
    },
    otp: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    otpTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    }
  }, {
    sequelize,
    modelName: 'account',
    tableName: 'account',
  });

  return Account;
};