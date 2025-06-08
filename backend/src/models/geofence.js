'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Geofence extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Geofence belongs to a user
      Geofence.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
    }
  }
  Geofence.init({
    userId: DataTypes.INTEGER,
    name: DataTypes.STRING,
    centerLat: DataTypes.DECIMAL,
    centerLng: DataTypes.DECIMAL,
    radius: DataTypes.DECIMAL,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Geofence',
  });
  return Geofence;
};