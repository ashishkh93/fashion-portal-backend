module.exports = (sequelize, DataTypes) => {
  const ArtOrder = sequelize.define(
    'ArtOrder',
    {
      artOrderId: {
        type: DataTypes.UUID,
        references: { model: 'Order', key: 'id' },
        onDelete: 'CASCADE',
      },
      artId: {
        type: DataTypes.UUID,
        references: { model: 'Art', key: 'id' },
        onDelete: 'CASCADE',
      },
      quantity: {
        type: DataTypes.INTEGER,
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
          exclude: ['createdAt', 'updatedAt', 'deletedAt'],
        },
      },
      timestamps: true,
    }
  );

  return ArtOrder;
};
