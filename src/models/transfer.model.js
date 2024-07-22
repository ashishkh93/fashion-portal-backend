module.exports = (sequelize, DataTypes) => {
  const Transfer = sequelize.define(
    'Transfer',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      payoutId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Payout', key: 'id' },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
      },
      artistId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'User', key: 'id' },
      },
      transactionId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      payoutTransferId: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      orderIds: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: false,
      },
      status: {
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
      tableName: 'Transfer',
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

  Transfer.associate = function (models) {
    Transfer.belongsTo(models.Payout, {
      foreignKey: 'payoutId',
      as: 'payout',
    });
    Transfer.belongsToMany(models.Order, {
      through: models.ArtistTransferOrder,
      foreignKey: 'transferId',
      otherKey: 'orderId',
      as: 'orders',
    });
  };

  return Transfer;
};
