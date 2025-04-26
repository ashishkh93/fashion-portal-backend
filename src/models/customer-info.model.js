module.exports = (sequelize, DataTypes) => {
  const CustomerInfo = sequelize.define(
    'CustomerInfo',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      customerId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'User', key: 'id' },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
      },
      status: {
        type: DataTypes.ENUM('APPROVED', 'PENDING', 'BLOCKED'),
        allowNull: false,
      },
      fullName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      dob: {
        type: DataTypes.STRING(14),
        allowNull: false,
      },
      gender: {
        type: DataTypes.ENUM('male', 'female'),
        allowNull: false,
      },
      profilePic: {
        type: DataTypes.STRING,
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
      tableName: 'CustomerInfo',
      // Define default scope to exclude createdAt and updatedAt globally
      defaultScope: {
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt'],
        },
      },
      timestamps: true,
      paranoid: true,
    }
  );

  CustomerInfo.associate = function (models) {
    CustomerInfo.belongsTo(models.User, { foreignKey: 'customerId', as: 'customerInfo' });
    CustomerInfo.hasMany(models.Review, { foreignKey: 'givenBy', sourceKey: 'customerId' });
    CustomerInfo.hasMany(models.Order, { foreignKey: 'customerId', sourceKey: 'customerId' });
    CustomerInfo.hasMany(models.Transaction, { foreignKey: 'customerId', sourceKey: 'customerId' });
    CustomerInfo.hasMany(models.FavoriteArtist, { foreignKey: 'customerId', sourceKey: 'customerId' });
  };

  return CustomerInfo;
};
