const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { encrypt, decrypt } = require('../utils/crypto');

module.exports = (sequelize, DataTypes) => {
  const ArtistBankingInfo = sequelize.define(
    'ArtistBankingInfo',
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
        references: { model: 'User', key: 'id' },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
      },
      beneficiaryId: {
        type: DataTypes.STRING(30),
        allowNull: true,
        unique: true,
      },
      bankName: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      upi: {
        type: DataTypes.STRING(150), // Maximum length for UPI ID (adjust if necessary)
        allowNull: false, // Allow null if UPI is optional for users
        unique: {
          msg: 'The UPI id you provided is already registered',
        },
        get() {
          const rawValue = this.getDataValue('upi');
          return rawValue ? decrypt(rawValue) : null;
        },
        // validate: {
        //   is: /^[\w.-]+@[\w.-]+$/, // Validate UPI format using a regular expression
        // },
      },
      pan: {
        type: DataTypes.STRING(10), // Assuming PAN card is always 10 characters
        allowNull: false,
        unique: {
          msg: 'The PAN number you provided is already exist in our system.',
        },
        validate: {
          is: /^[A-Z]{5}[0-9]{4}[A-Z]$/i, // Validate format using a regular expression
        },
      },
      panImage: {
        type: DataTypes.STRING,
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
    },
    {
      tableName: 'ArtistBankingInfo',
      hooks: {
        beforeCreate: async (artist) => {
          updateUpiInCipher(artist);
        },
        beforeUpdate: async (artist) => {
          updateUpiInCipher(artist);
        },
      },
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

  const updateUpiInCipher = (artist) => {
    let { upi } = artist.dataValues;
    if (upi) {
      // Validate UPI format
      if (!/^[\w.-]+@[\w.-]+$/.test(upi)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'UPI is invalid, please enter a valid UPI');
      }

      // Encrypt UPI
      artist.upi = encrypt(upi);
    }
  };

  ArtistBankingInfo.associate = function (models) {
    ArtistBankingInfo.belongsTo(models.ArtistInfo, {
      foreignKey: 'artistId',
      targetKey: 'artistId',
    });
  };

  return ArtistBankingInfo;
};
