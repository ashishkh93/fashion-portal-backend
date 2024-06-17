module.exports = (sequelize, DataTypes) => {
  const Art = sequelize.define(
    'Art',
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
      },
      serviceId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      categoryId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      price: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      advanceAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      searchKeywords: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      timeToCompleteInMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      renderIndex: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      coverImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reasonToDeclineArt: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
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

  Art.associate = function (models) {
    Art.belongsTo(models.ArtistInfo, {
      foreignKey: 'artistId',
      targetKey: 'artistId',
    });
    Art.belongsTo(models.Service, {
      foreignKey: 'serviceId',
      as: 'service',
    });
    Art.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category',
    });
    Art.belongsToMany(models.Order, {
      through: 'ArtOrder', // Corrected join table name
      foreignKey: 'artId', // This should be the name used in the join table for Art's ID
      otherKey: 'artOrderId', // This should be the name used in the join table for Order's ID
    });
  };

  return Art;
};
