module.exports = (sequelize, DataTypes) => {
  const CustomerAddress = sequelize.define(
    'CustomerAddress',
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
        references: { model: 'User', key: 'id' },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
      },
      street: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      buildingNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      houseNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      landmark: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pincode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country: {
        type: DataTypes.ENUM('india'),
        allowNull: false,
        defaultValue: 'india',
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
      tableName: 'CustomerAddress',
      defaultScope: {
        attributes: {
          exclude: ['deletedAt'],
        },
      },
      timestamps: true,
      paranoid: true,
      indexes: [{ fields: ['pincode'] }, { fields: ['city'] }, { fields: ['state'] }],
    }
  );

  CustomerAddress.associate = function (models) {
    CustomerAddress.belongsTo(models.CustomerInfo, {
      foreignKey: 'customerId',
      as: 'address',
      targetKey: 'customerId',
    });
    CustomerAddress.hasOne(models.Order, { foreignKey: 'addressId' });
  };

  return CustomerAddress;
};
