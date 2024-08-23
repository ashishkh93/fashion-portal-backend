const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { encrypt, decrypt, hashString } = require('../utils/crypto');

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
        // unique: true,
      },
      accountHolderName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      // bankName: {
      //   type: DataTypes.STRING(50),
      //   allowNull: true,
      // },
      upi: {
        type: DataTypes.STRING(150), // Maximum length for UPI ID (adjust if necessary)
        allowNull: false, // Allow null if UPI is optional for users
        set(value) {
          const encryptedValue = encrypt(value);
          this.setDataValue('upi', encryptedValue);
          this.setDataValue('upiHash', hashString(value)); // Store the hash for uniqueness
        },
        get() {
          const encryptedValue = this.getDataValue('upi');
          return encryptedValue ? decrypt(encryptedValue) : null;
        },
      },
      upiHash: {
        type: DataTypes.STRING(64), // Length of SHA-256 hash
        allowNull: false,
        unique: {
          msg: 'The UPI ID you provided already exists in the system',
        },
      },
      upiVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      canUpdateBankingInfo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      // pan: {
      //   type: DataTypes.STRING(10), // Assuming PAN card is always 10 characters
      //   allowNull: false,
      //   unique: {
      //     msg: 'The PAN number you provided is already exist in our system.',
      //   },
      //   validate: {
      //     is: /^[A-Z]{5}[0-9]{4}[A-Z]$/i, // Validate format using a regular expression
      //   },
      // },
      // panImage: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
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
      // Define default scope to exclude createdAt and updatedAt globally
      defaultScope: {
        attributes: {
          exclude: ['upiHash', 'deletedAt'],
        },
      },

      timestamps: true,
      paranoid: true,
    }
  );

  ArtistBankingInfo.associate = function (models) {
    ArtistBankingInfo.belongsTo(models.ArtistInfo, {
      foreignKey: 'artistId',
      targetKey: 'artistId',
    });
  };

  return ArtistBankingInfo;
};
