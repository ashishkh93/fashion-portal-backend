module.exports = (sequelize, DataTypes) => {
  const RefundTransaction = sequelize.define(
    'RefundTransaction',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      cfOrderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Orders', key: 'id' },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
      },
      cfPaymentId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      refundStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      refundAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      refundCurrency: {
        type: DataTypes.STRING,
        defaultValue: 'INR',
        allowNull: false,
      },
      details: {
        type: DataTypes.JSON,
        allowNull: false,
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

  RefundTransaction.associate = function (models) {
    RefundTransaction.belongsTo(models.Order, { foreignKey: 'cfOrderId', as: 'orderTransactions' });
    // Transaction.hasOne(models.Order, { foreignKey: 'transactionId' });
  };

  return RefundTransaction;
};
