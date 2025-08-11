/// <reference path="../../common/common.js" />

var PaymentMethodManager = {
  initPaymentMethod: function () {
    PaymentMethodDetailsHelper.paymentMethodInit();
    PaymentMethodSummaryHelper.initPaymentMethodSummary();
  }
};