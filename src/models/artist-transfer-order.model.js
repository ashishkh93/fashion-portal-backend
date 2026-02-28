module.exports = (sequelize, DataTypes) => {
  const ArtistTransferOrder = sequelize.define(
    'ArtistTransferOrder',
    {
      transferId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'ArtistTransfer', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'Order', key: 'id' },
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
      tableName: 'ArtistTransferOrder',
      // Define default scope to exclude createdAt and updatedAt globally
      defaultScope: {
        attributes: {
          exclude: ['deletedAt'],
        },
      },
      timestamps: true,
    }
  );

  return ArtistTransferOrder;
};
