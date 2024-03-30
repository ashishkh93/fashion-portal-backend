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
      searchKeywords: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
      },
      timeToCompleteInMinutes: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
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
        type: DataTypes.STRING(),
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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

  Art.associate = function (models) {};

  return Art;
};
