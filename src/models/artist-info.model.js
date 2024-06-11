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
      beneficiaryId: {
        type: DataTypes.STRING(30),
        allowNull: true,
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
      bankName: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      upi: {
        type: DataTypes.STRING(120), // because we are storing the cipher
        allowNull: true,
      },
      // bankAccountHolderName: {
      //   type: DataTypes.STRING(100),
      //   allowNull: false,
      // },
      // bankAccountNumber: {
      //   type: DataTypes.STRING(1000),
      //   allowNull: false,
      // },
      // bankIfscCode: {
      //   type: DataTypes.STRING(20),
      //   allowNull: false,
      // },
      // cancelChequeImage: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
      // aadharCardNumber: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
      // aadharCardFrontImage: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
      // aadharCardBackImage: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
      // pancardImage: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
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
      city: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      state: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      pincode: {
        type: DataTypes.STRING(8),
        allowNull: true,
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
          exclude: ['deletedAt'],
        },
      },
      timestamps: true,
      paranoid: true,
    }
  );

  ArtistInfo.associate = function (models) {
    ArtistInfo.belongsTo(models.User, { foreignKey: 'artistId', as: 'artist' });
    ArtistInfo.belongsToMany(models.Service, {
      through: 'ArtistInfoService', // Corrected join table name
      foreignKey: 'artistInfoId', // Corrected foreignKey to represent ArtistInfo's ID in join table
      otherKey: 'serviceId', // Corrected otherKey to represent Service's ID in join table
      as: 'artistServices',
    });
    ArtistInfo.hasMany(models.Review, { foreignKey: 'artistId', sourceKey: 'artistId', as: 'artistReview' });
  };

  return ArtistInfo;
};
