module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define(
    'Transaction',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      cfOrderId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cfPaymentId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      paymentStatus: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      paymentAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      paymentCurrency: {
        type: DataTypes.STRING,
        defaultValue: 'INR',
        allowNull: false,
      },
      paymentMethod: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      paymentType: {
        type: DataTypes.ENUM('advance', 'final', 'artist_payout'),
        allowNull: true,
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

  Transaction.associate = function (models) {
    Transaction.belongsTo(models.Order, { foreignKey: 'cfOrderId', as: 'orderTransactions' });
    Transaction.hasOne(models.Order, { foreignKey: 'transactionId' });
  };

  return Transaction;
};
