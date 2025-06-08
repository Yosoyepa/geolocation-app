'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Location belongs to a device
      Location.belongsTo(models.Device, {
        foreignKey: 'deviceId',
        as: 'device'
      });
    }
  }
  Location.init({
    deviceId: DataTypes.INTEGER,
    latitude: DataTypes.DECIMAL,
    longitude: DataTypes.DECIMAL,
    accuracy: DataTypes.DECIMAL,
    timestamp: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Location',
  });
  return Location;
};