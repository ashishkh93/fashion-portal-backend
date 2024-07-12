module.exports = (sequelize, DataTypes) => {
  const Review = sequelize.define(
    'Review',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      artistId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'ArtistInfo',
          key: 'artistId',
        },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
      },
      orderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Order',
          key: 'id',
        },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
      },
      givenBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'CustomerInfo',
          key: 'customerId',
        },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
      },
      reviewCount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      description: {
        type: DataTypes.STRING(1024),
        allowNull: true,
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
      tableName: 'Review',
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

  /** Associations */
  Review.associate = function (models) {
    Review.belongsTo(models.Order, { foreignKey: 'orderId' });
    Review.belongsTo(models.ArtistInfo, { foreignKey: 'artistId', targetKey: 'artistId', as: 'ArtistInformation' });
    Review.belongsTo(models.CustomerInfo, { foreignKey: 'givenBy', targetKey: 'customerId', as: 'CustomerInformation' });
  };

  return Review;
};
