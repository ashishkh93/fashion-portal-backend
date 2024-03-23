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
        type: DataTypes.ENUM('superAdmin', 'artist', 'user'),
        allowNull: false,
      },
      phone: {
        type: DataTypes.STRING(10),
        allowNull: false,
        // unique: true,
      },
      otp: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      otpExpire: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
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
    User.hasOne(models.SuperAdminInfo, { foreignKey: 'userId' });
    User.hasOne(models.CustomerInfo, { foreignKey: 'userId' });
    User.hasOne(models.ArtistInfo, { foreignKey: 'userId', as: 'artistInfos' });
  };

  return User;
};
