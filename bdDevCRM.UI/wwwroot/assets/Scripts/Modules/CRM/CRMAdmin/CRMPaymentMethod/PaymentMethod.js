/// <reference path="../../common/common.js" />

$(document).ready(function () {
  PaymentMethodManager.initPaymentMethod();
});

var PaymentMethodManager = {
  initPaymentMethod: function () {
    PaymentMethodDetailsHelper.paymentMethodInit();
    PaymentMethodSummaryHelper.initPaymentMethodSummary();
  }
};