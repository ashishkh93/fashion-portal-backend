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
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'blocked', 'suspended'),
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
      bankName: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      bankAccountHolderName: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      bankAccountNumber: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },
      bankIfscCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      cancelChequeImage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      aadharCardNumber: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      aadharCardFrontImage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      aadharCardBackImage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: false,
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

  ArtistInfo.associate = function (models) {
    ArtistInfo.belongsTo(models.User, { foreignKey: 'artistId' });
    ArtistInfo.belongsToMany(models.Service, {
      through: 'ArtistInfoService', // Corrected join table name
      foreignKey: 'artistInfoId', // Corrected foreignKey to represent ArtistInfo's ID in join table
      otherKey: 'serviceId', // Corrected otherKey to represent Service's ID in join table
      as: 'artistServices',
    });
  };

  return ArtistInfo;
};
