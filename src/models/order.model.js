module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    'Order',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      customerId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      artistId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      transactionId: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      artIds: {
        type: DataTypes.ARRAY(DataTypes.UUID),
        allowNull: false,
      },
      totalAmount: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      advanceAmountForOrder: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
      },
      advanceAmountPaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      discount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      addOnAmount: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      date: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      time: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled by artist', 'cancelled by customer'),
        allowNull: false,
      },
      customerOrderNote: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      artistOrderNote: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      artistAddOnNote: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        // get() {
        //   const rawValue = this.getDataValue('createdAt');
        //   return rawValue ? moment(rawValue).tz('Asia/Kolkata').format() : null;
        // },
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

  Order.associate = function (models) {
    Order.belongsTo(models.User, { foreignKey: 'customerId', as: 'customer' });
    Order.belongsToMany(models.Art, {
      through: 'ArtOrder',
      foreignKey: 'artOrderId', // Reference from ArtOrder to Order
      otherKey: 'artId', // Reference from ArtOrder to Art
      as: 'arts',
    });
  };

  return Order;
};
