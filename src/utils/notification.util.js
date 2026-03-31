const NOTIFICATION_TYPE_CONSTANTS = {
  NEW_ORDER_REQUEST: 'new_order_request',
  ORDER_ACCEPTED: 'order_accepted',
  ORDER_REJECTED: 'order_rejected',
  ORDER_CANCELLED_BY_ARTIST: 'order_cancelled_by_artist',
  ORDER_CANCELLED_BY_CUSTOMER_NO_ADVANCE: 'order_cancelled_by_customer_and_artist_wont_get_advance_amount',
  ORDER_CANCELLED_BY_CUSTOMER_WITH_ADVANCE: 'order_cancelled_by_customer_and_artist_will_get_advance_amount',
  AUTO_CANCELLED_NOT_RESPONDED: 'auto_order_cancelled_due_to_not_responded_request',
  AUTO_CANCELLED_UNPAID_ADVANCE: 'auto_order_cancelled_due_to_unpaid_advance_amount',
  ADVANCE_PAYMENT_RECEIVED: 'advance_amount_payment_received',
  ADVANCE_PAYMENT_FAILED: 'advance_amount_payment_failed',
  FINAL_PAYMENT_RECEIVED: 'final_amount_payment_received',
  FINAL_PAYMENT_FAILED: 'final_amount_payment_failed',
  ORDER_COMPLETED: 'order_completed',
  CUSTOM_FROM_ADMIN: 'custom_from_admin',
  ARTIST_STATUS_UPDATED: 'artist_status_updated',
};

module.exports = { NOTIFICATION_TYPE_CONSTANTS };