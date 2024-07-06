module.exports = (sequelize, DataTypes) => {
  const ArtistInfo = sequelize.define(
    'ArtistInfo',
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
        unique: true,
        references: { model: 'Users', key: 'id' },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
      },
      status: {
        type: DataTypes.ENUM('PENDING', 'APPROVED', 'REJECTED', 'BLOCKED', 'SUSPENDED'),
        allowNull: false,
      },
      fullName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      businessName: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      dob: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      gender: {
        type: DataTypes.ENUM('male', 'female'),
        allowNull: false,
      },
      profilePic: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      aboutInfo: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      services: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false,
      },
      recentWorkImages: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      userVisitedCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },
      happyCustomerCount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: true,
      },
      workingTime: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },
      latitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      longitude: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      pincode: {
        type: DataTypes.STRING(8),
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      country: {
        type: DataTypes.ENUM('india'),
        defaultValue: 'india',
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
      tableName: 'ArtistInfo',
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

  ArtistInfo.associate = function (models) {
    ArtistInfo.belongsTo(models.User, { foreignKey: 'artistId', as: 'artist' });
    ArtistInfo.hasOne(models.ArtistBankingInfo, { foreignKey: 'artistId', sourceKey: 'artistId', as: 'artistBankingInfo' });
    ArtistInfo.belongsToMany(models.Service, {
      through: 'ArtistInfoService', // Corrected join table name
      foreignKey: 'artistInfoId', // Corrected foreignKey to represent ArtistInfo's ID in join table
      otherKey: 'serviceId', // Corrected otherKey to represent Service's ID in join table
      as: 'artistServices',
    });
    ArtistInfo.hasMany(models.Review, { foreignKey: 'artistId', sourceKey: 'artistId', as: 'artistReview' });
    ArtistInfo.hasMany(models.Art, {
      foreignKey: 'artistId',
      sourceKey: 'artistId',
      as: 'arts',
    });
  };

  return ArtistInfo;
};
