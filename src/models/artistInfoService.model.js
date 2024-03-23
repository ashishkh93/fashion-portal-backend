module.exports = (sequelize, DataTypes) => {
  const ArtistInfoService = sequelize.define(
    'ArtistInfoService',
    {
      artistInfoId: {
        type: DataTypes.UUID,
        references: { model: 'ArtistInfo', key: 'id' }, // To join the Artist info table with Service
        onDelete: 'CASCADE',
      },
      serviceId: {
        type: DataTypes.UUID,
        references: { model: 'Service', key: 'id' }, // To join the Service table with ArtistInfo
        onDelete: 'CASCADE',
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      // Define default scope to exclude createdAt and updatedAt globally
      defaultScope: {
        attributes: {
          exclude: ['createdAt', 'updatedAt'],
        },
      },
      timestamps: true,
    }
  );

  return ArtistInfoService;
};
