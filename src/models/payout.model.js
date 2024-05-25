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
      batchPayoutId: {
        type: DataTypes.STRING(40),
        allowNull: false,
      },
      artistIds: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
      },
      detail: {
        type: DataTypes.JSON,
        allowNull: false,
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

  Payout.associate = function (models) {};

  return Payout;
};
