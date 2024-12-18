'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ProductFeedback extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ProductFeedback.belongsTo(models.Product, {
        foreignKey: 'idProduct',  // from ProductFeedback
        as: 'product'
      });
    }
  }
  ProductFeedback.init({
    idProductFeedback: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    idProduct: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ProductFeedback',
    timestamps: true,
  });
  return ProductFeedback;
};
