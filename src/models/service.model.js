module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define(
    'Service',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      icon: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      coverImage: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      renderIndex: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
      paranoid: true,
    }
  );

  Service.associate = function (models) {
    Service.belongsToMany(models.User, {
      through: 'ArtistInfoService', // Corrected join table name
      foreignKey: 'serviceId', // This should be the name used in the join table for Service's ID
      otherKey: 'artistInfoId', // This should be the name used in the join table for ArtistInfo's ID
    });
  };

  return Service;
};
