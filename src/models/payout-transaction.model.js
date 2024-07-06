module.exports = (sequelize, DataTypes) => {
  const PayoutTransaction = sequelize.define(
    'PayoutTransaction',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      payoutTransferId: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      acknowledged: {
        type: DataTypes.STRING(5),
        allowNull: true,
      },
      transferStatus: {
        type: DataTypes.ENUM(
          'INITIATED',
          'TRANSFER_SUCCESS',
          'TRANSFER_FAILED',
          'TRANSFER_REVERSED',
          'CREDIT_CONFIRMATION',
          'TRANSFER_ACKNOWLEDGED',
          'TRANSFER_REJECTED',
          'BENEFICIARY_INCIDENT',
          'LOW_BALANCE_ALERT'
        ),
        allowNull: false,
      },
      eventTime: {
        type: DataTypes.DATE,
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
      tableName: 'PayoutTransaction',
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

  PayoutTransaction.associate = function (models) {};

  return PayoutTransaction;
};
