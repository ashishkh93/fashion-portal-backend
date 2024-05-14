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
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      time: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          'pending',
          'approved',
          'rejected',
          'not_responded',
          'auto_cancelled_due_to_unpaid_advance_amount',
          'cancelled_by_artist',
          'cancelled_by_customer',
          'completed'
        ),
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
      approvedAt: {
        type: DataTypes.DATE,
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
    Order.hasOne(models.OrderFinancialInfo, { foreignKey: 'orderId', as: 'orderFinancialInfo' });
    Order.hasMany(models.Transaction, { foreignKey: 'cfOrderId' });
    Order.belongsTo(models.Transaction, { foreignKey: 'transactionId' });
    Order.belongsToMany(models.Art, {
      through: 'ArtOrder',
      foreignKey: 'artOrderId', // Reference from ArtOrder to Order
      otherKey: 'artId', // Reference from ArtOrder to Art
      as: 'arts',
    });
  };

  return Order;
};
