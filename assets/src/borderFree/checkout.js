/*
 * Implementation for borderFree.checkout.js
 * Description: Module to get common functions at one place
 */

/**
 * Border Free Checkout factory object to perform various operations 
 */

var cartResourceFactory = require('mozu-node-sdk/clients/commerce/cart');
var generalSettings = require('mozu-node-sdk/clients/commerce/settings/generalSettings');
/**Get mozu sdk constants */
var xmljson = require('xmljson');

var mozuConstants = require("mozu-node-sdk/constants");
var helper = require('./helper');
var bf_Constants = require("./constants");



var defaultRedirect = bf_Constants.BF_DEFAULT_REDIRECT;


module.exports = {
  /*Common method to create mozu factory client*/
  createClientFromContext: function (client, context, removeClaims) {
    var c = client(context);
    if (removeClaims)
      c.context[mozuConstants.headers.USERCLAIMS] = null;
    return c;
  },
  getCheckoutSettings: function (context) {
    var client = this.createClientFromContext(generalSettings, context, true);
    return client.getGeneralSettings().then(function (setting) {
      return setting;
    });
  },
  getCheckoutModel: function (context) {
    var kiboCheckoutModel = (context.response.viewData || {}).model;
    return kiboCheckoutModel;
  },
  /* Delete cart items using Kibo Ecomm API.*/
  deleteCartData: function (cancelOrderData, context, call) {
    var refObj = this;

    // get checkout factory object
    var cartResource = refObj.createClientFromContext(cartResourceFactory, context, true);

    // remove cart Id from response URL
    refObj.removeCartIDFromParam(context);

    cartResource.deleteCart({
      cartId: cancelOrderData.originalCartId
    }).then(function (cartData) {
      /*context.response.viewData.model.messages = [{
          'messageType': "borderFree",
          'status': borderFreeResponse.ppStatus,
          "message": "Thank you for your order!  You will receive an email confirmation."
        }]; */
      return;
    }, function (err1) {
      console.log("err1: ", err1);
      return;
    });
  },
  /* remove cart Id from response UR.*/
  removeCartIDFromParam: function (context) {
    var uri = context.request.url;
    if (uri.indexOf("&originalCartId") > 0) {
      var clean_uri = uri.replace(new RegExp('originalCartId' + "=\\w+"), "").replace("?&", "?").replace("&&", "&");
      context.response.redirect(clean_uri);
      return;
    }
  },
  prepareNumber: function (num, doubleZero) {
    var str = num.toString().replace(',', '.');

    var index = str.indexOf('.');
    if (index > -1) {
      var len = str.substring(index + 1).length;
      if (len === 1) {
        str += '0';
      }

      if (len > 2) {
        str = str.substring(0, index + 3);
      }
    } else {
      if (doubleZero || true) {
        str += '.00';
      }
    }
    return str;
  },
  getCheckoutSessionData: function (context) {
    var checkoutSession = context.items.siteContext;
    var checkoutModel = this.getCheckoutModel(context);

    var bf_session_data = {
      id: checkoutModel.id,
      ipAddress: checkoutModel.ipAddress,
      orderNumber: checkoutSession.generalSettings.isMultishipEnabled ? checkoutModel.number : checkoutModel.orderNumber,
      isMultiship: checkoutSession.generalSettings.isMultishipEnabled,
      originalCartId: checkoutModel.originalCartId,
      secureHost: checkoutSession.secureHost
    };
    return bf_session_data;
  },
  getCheckoutUrls: function (context) {
    var orderData = this.getCheckoutSessionData(context);
    return {
      "successUrl": orderData.secureHost + bf_Constants.BF_INTERNATIONAL_PAGE + "?action=borderFree&orderNo=" + orderData.orderNumber,
      "pendingUrl": orderData.secureHost + bf_Constants.BF_INTERNATIONAL_PAGE + "?basketId=" + orderData.orderNumber,
      "failureUrl": orderData.secureHost + defaultRedirect,
      "callbackUrl": orderData.secureHost + defaultRedirect,
      "basketUrl": orderData.secureHost + defaultRedirect,
      "contextChooserPageUrl": orderData.secureHost + defaultRedirect,
      "usCartStartPageUrl": orderData.secureHost + defaultRedirect,
      "paymentUrls": {
        "payPalUrls": {
          "returnUrl": orderData.secureHost + bf_Constants.BF_INTERNATIONAL_PAGE + "?action=borderFree&orderNo=" + orderData.orderNumber + "&originalCartId=" + orderData.originalCartId,
          "cancelUrl": orderData.secureHost + defaultRedirect,
          "headerLogoUrl": orderData.secureHost + "/resources/images/logo.png"
        }
      }
    };
  },
  getCheckout: function (context, callback) {
    var self = this;
    var checkoutID = this.getCheckoutSessionData(context);
    var selectedExData = helper.getExchangeRateData(context);
    return helper.getEntities(context).then(function (config) {
      if (selectedExData.country_code.toUpperCase() !== 'US') {
        return helper.getOrder(context, checkoutID.id).then(function (order) {
          return {
            config: config,
            order: helper.getOrderDetails(order)
          };
        });
      } else {
        return;
      }
    }).then(function (response) {
      console.log("response: ------", response);
      return;
    });
  },
  getborderFreeCart: function () {

  }
};