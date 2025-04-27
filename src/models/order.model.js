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
        references: { model: 'User', key: 'id' },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
      },
      artistId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'User', key: 'id' },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
      },
      orderIdentity: {
        type: DataTypes.STRING(50),
        unique: true,
        allowNull: false,
      },
      transactionId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: { model: 'Transaction', key: 'id' },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
      },
      addressId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'CustomerAddress', key: 'id' },
        onDelete: 'NO ACTION',
        onUpdate: 'CASCADE',
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
          'PENDING',
          'APPROVED',
          'REJECTED',
          'NOT_RESPONDED',
          'AUTO_CANCELLED_DUE_TO_UNPAID_ADVANCE_AMOUNT',
          'CANCELLED_BY_ARTIST',
          'CANCELLED_BY_CUSTOMER',
          'COMPLETED'
        ),
        allowNull: false,
        defaultValue: 'PENDING',
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
      tableName: 'Order',
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
    Order.belongsTo(models.CustomerInfo, { foreignKey: 'customerId', as: 'orderCustomer', targetKey: 'customerId' });
    Order.belongsTo(models.ArtistInfo, { foreignKey: 'artistId', as: 'orderArtist', targetKey: 'artistId' });
    Order.hasOne(models.OrderFinancialInfo, { foreignKey: 'orderId', as: 'orderFinancialInfo' });
    Order.hasMany(models.Transaction, { foreignKey: 'cfOrderId' });
    // Order.belongsTo(models.Transaction, { foreignKey: 'transactionId' });
    Order.belongsToMany(models.Art, {
      through: 'ArtOrder',
      foreignKey: 'artOrderId', // Reference from ArtOrder to Order
      otherKey: 'artId', // Reference from ArtOrder to Art
      as: 'arts',
    });
    Order.belongsToMany(models.Transfer, {
      through: models.ArtistTransferOrder,
      foreignKey: 'orderId',
      otherKey: 'transferId',
    });
    Order.hasOne(models.Review, { foreignKey: 'orderId', as: 'orderReview' });
    Order.hasMany(models.ScheduledJob, { foreignKey: 'orderId' });
    Order.belongsTo(models.CustomerAddress, { foreignKey: 'addressId', as: 'address' });
  };

  return Order;
};
