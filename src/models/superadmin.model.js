module.exports = (sequelize, DataTypes) => {
  const SuperAdminInfo = sequelize.define(
    'SuperAdminInfo',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      superAdminId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        references: { model: 'User', key: 'id' },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
      },
      fullName: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: true,
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
      tableName: 'SuperAdminInfo',
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

  SuperAdminInfo.associate = function (models) {
    SuperAdminInfo.belongsTo(models.User, { foreignKey: 'superAdminId', as: 'superAdminInfos' });
  };

  return SuperAdminInfo;
};
