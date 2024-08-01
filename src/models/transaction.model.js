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
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Order', key: 'id' },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
      },
      cfPaymentId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'User',
          key: 'id',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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
      tableName: 'Transaction',
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
    Transaction.belongsTo(models.CustomerInfo, { foreignKey: 'customerId', as: 'customer', targetKey: 'customerId' });
  };

  return Transaction;
};
