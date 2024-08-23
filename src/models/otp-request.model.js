module.exports = (sequelize, DataTypes) => {
  const OtpRequest = sequelize.define(
    'OtpRequest',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'User', key: 'id' },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
      },
      context: {
        type: DataTypes.ENUM('LOGIN', 'BANKING'),
        allowNull: false,
      },
      otp: {
        type: DataTypes.STRING(8),
        allowNull: false,
      },
      otpExpiration: {
        type: DataTypes.BIGINT,
        allowNull: true,
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      numberOfAttempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          max: 3, // maximum number of attempts
        },
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
      tableName: 'OtpRequest',
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

  OtpRequest.associate = function (models) {};

  return OtpRequest;
};
