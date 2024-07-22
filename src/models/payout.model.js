module.exports = (sequelize, DataTypes) => {
  const Payout = sequelize.define(
    'Payout',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      batchTransferId: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      artistIds: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: false,
      },
      totalBatchPayoutAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      orderDetail: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      transactionId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      fromDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      toDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('INITIATED', 'RECEIVED', 'SUCCESS', 'FAILED'),
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
      tableName: 'Payout',
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

  Payout.associate = function (models) {
    Payout.hasMany(models.Transfer, {
      foreignKey: 'payoutId',
      as: 'payoutTransfers',
    });
  };

  return Payout;
};
