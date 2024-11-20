module.exports = (sequelize, DataTypes) => {
  const FavoriteArtist = sequelize.define(
    'FavoriteArtist',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      customerId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'CustomerInfo', key: 'customerId' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      artistId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'ArtistInfo', key: 'artistId' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
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
      tableName: 'FavoriteArtist',
      // Define default scope to exclude createdAt and updatedAt globally
      defaultScope: {
        attributes: {
          exclude: ['createdAt', 'updatedAt', 'deletedAt'],
        },
      },
      timestamps: true,
      paranoid: true,
    }
  );

  FavoriteArtist.associate = (models) => {
    FavoriteArtist.belongsTo(models.ArtistInfo, {
      foreignKey: 'artistId',
      targetKey: 'artistId',
      as: 'artist',
    });
    FavoriteArtist.belongsTo(models.CustomerInfo, {
      foreignKey: 'customerId',
      targetKey: 'customerId',
      as: 'customer',
    });
  };

  return FavoriteArtist;
};
