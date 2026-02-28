module.exports = (sequelize, DataTypes) => {
  const ArtistProfileVisitLog = sequelize.define(
    'ArtistProfileVisitLog',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      artistId: {
        type: DataTypes.UUID,
        references: {
          model: 'ArtistInfo',
          key: 'artistId',
        },
        allowNull: false,
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      customerId: {
        type: DataTypes.UUID,
        allowNull: true, // null if it's a guest user
        references: {
          model: 'CustomerInfo',
          key: 'customerId',
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      visitedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      source: {
        type: DataTypes.STRING, // optional (e.g., "home_feed", "search", etc.)
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
      tableName: 'ArtistProfileVisitLog',
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
  ArtistProfileVisitLog.associate = function (models) {
    ArtistProfileVisitLog.belongsTo(models.ArtistInfo, { foreignKey: 'artistId', targetKey: 'artistId', as: 'artist' });
    ArtistProfileVisitLog.belongsTo(models.CustomerInfo, {
      foreignKey: 'customerId',
      targetKey: 'customerId',
      as: 'customer',
    });
  };

  return ArtistProfileVisitLog;
};
