'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Device belongs to a user
      Device.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });
      
      // Device has many locations
      Device.hasMany(models.Location, {
        foreignKey: 'deviceId',
        as: 'locations'
      });
    }
  }
  Device.init({
    userId: DataTypes.INTEGER,
    deviceName: DataTypes.STRING,
    deviceType: DataTypes.STRING,
    isActive: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Device',
  });
  return Device;
};