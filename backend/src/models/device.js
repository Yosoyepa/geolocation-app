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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    deviceName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'deviceName'
    },
    deviceType: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'deviceType'
    },
    platform: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'platform'
    },
    version: {
      type: DataTypes.STRING,
      allowNull: true,
      field: 'version'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'isActive'
    },
    lastConnectedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'lastConnectedAt'
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: {},
      field: 'metadata'
    }
  }, {
    sequelize,
    modelName: 'Device',
  });
  return Device;
};