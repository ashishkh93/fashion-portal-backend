module.exports = (sequelize, DataTypes) => {
  const FirebaseUser = sequelize.define(
    'FirebaseUser',
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
      fcmToken: {
        type: DataTypes.STRING(256),
        allowNull: false,
        unique: true,
      },
      deviceInfo: {
        type: DataTypes.JSONB, // or separate fields if preferred
        allowNull: true,
        comment: 'Includes device model, OS version, app version, etc.',
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      preferences: {
        type: DataTypes.JSONB,
        defaultValue: {
          promotional: true,
          appointmentUpdates: true,
          reviews: true,
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
      tableName: 'FirebaseUser',
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

  /**
   * Helper method for defining associations.
   * This method is not a part of DataTypes lifecycle.
   * The `models/index` file will call this method automatically.
   */
  FirebaseUser.associate = function (models) {
    FirebaseUser.belongsTo(models.User, { foreignKey: 'userId' });
  };

  return FirebaseUser;
};
