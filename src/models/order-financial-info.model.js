module.exports = (sequelize, DataTypes) => {
  const OrderFinancialInfo = sequelize.define(
    'OrderFinancialInfo',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      orderId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      advanceAmountForOrder: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },
      advanceAmountPaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      discount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      addOnAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      artistAddOnNote: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      advancePaidAt: {
        type: DataTypes.DATE,
      },
      paidToArtist: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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

  OrderFinancialInfo.associate = function (models) {
    OrderFinancialInfo.belongsTo(models.Order, { foreignKey: 'orderId' });
  };

  return OrderFinancialInfo;
};
