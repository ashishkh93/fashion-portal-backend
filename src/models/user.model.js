module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      role: {
        type: DataTypes.ENUM('superAdmin', 'artist', 'customer'),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(10),
        allowNull: false,
        // unique: true,
      },
      fcmToken: {
        type: DataTypes.STRING(256),
        allowNull: true,
        unique: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      tokenVersion: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      reasonToDecline: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
      deletedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      tableName: 'User',
      // Define default scope to exclude createdAt and updatedAt globally
      defaultScope: {
        attributes: {
          exclude: ['deletedAt'],
        },
      },
      timestamps: true,
      paranoid: true,
    }
  );

  // check mobile is exist or not
  User.prototype.isPhoneNumberTaken = async function (phone, role) {
    if (phone === this.phone && role === this.role) {
      return true;
    }
    return false;
  };

  /**
   * Helper method for defining associations.
   * This method is not a part of DataTypes lifecycle.
   * The `models/index` file will call this method automatically.
   */
  User.associate = function (models) {
    User.hasOne(models.SuperAdminInfo, { foreignKey: 'superAdminId' });
    User.hasOne(models.CustomerInfo, { foreignKey: 'customerId', as: 'customerInfo' });
    User.hasOne(models.ArtistInfo, { foreignKey: 'artistId', as: 'artistInfos' });
    User.hasMany(models.RefundRequest, { foreignKey: 'customerId' });
    User.hasMany(models.Token, { foreignKey: 'userId' });
  };

  return User;
};
