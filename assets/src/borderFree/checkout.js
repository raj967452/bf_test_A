/*
 * Implementation for borderFree.checkout.js
 * Description: Module to get common functions at one place
 */

/**
 * Border Free Checkout factory object to perform various operations 
 */

var cartResourceFactory = require('mozu-node-sdk/clients/commerce/cart');
/**Get mozu sdk constants */
var xmljson = require('xmljson');

var mozuConstants = require("mozu-node-sdk/constants");
var errorSet = require("../borderFree/errors.json");
var helper = require('./helper');
var borderFreeConstants = require("./constants");


var defaultRedirect = borderFreeConstants.BF_DEFAULT_REDIRECT;


module.exports = {
  /*Common method to create mozu factory client*/
  createClientFromContext: function (client, context, removeClaims) {
    var c = client(context);
    if (removeClaims)
      c.context[mozuConstants.headers.USERCLAIMS] = null;
    return c;
  },
  getChecoutModel: function (context) {
    var kiboCheckoutModel = (context.response.viewData || {}).model;
    return kiboCheckoutModel;
  },
  /* Delete cart items using Kibo Ecomm API.*/
  deleteCartData: function (cancelOrderData, context, call) {
    var refObj = this;

    // get checkout factory object
    var cartResource = refObj.createClientFromContext(cartResourceFactory, context, true);

    // remove cart Id from response URL
    //refObj.removeCartIDFromParam(context);

    cartResource.deleteCart({
      cartId: cancelOrderData.originalCartId
    }).then(function (cartData) {
      context.response.viewData.model.messages = [{
          'messageType': "borderFree",
          'status': borderFreeResponse.ppStatus,
          "message": "Thank you for your order!  You will receive an email confirmation."
        }];     
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
     // context.response.redirect(clean_uri);
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
  getSoapOptionsFromBF: function (bfSettings, borderFreeCart, options) {
    return {
      method: options.type,
      url: options.url,
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/xml',
        'merchantid': bfSettings.bf_merchant_id,
        //'Authorization': "Basic " + new Buffer(bfSettings.bf_api_username + ":" + bfSettings.bf_api_password).toString("base64")
        'Authorization': "Basic a2lib19mcmVuY2h0b2FzdF9zdGdfYXBpOmJORzdBYWFC"
      },
      'body': borderFreeCart
    };
  },
  getCheckoutSessionData: function (context) {
    var checkoutModel = this.getChecoutModel(context);
    var bf_session_data = {
      id: checkoutModel.id,
      ipAddress: checkoutModel.ipAddress,
      orderNumber: checkoutModel.orderNumber
    };
    return bf_session_data;
  },
  getRedirectURL: function (context, res) {
    var siteContext = context.items.siteContext;
    return siteContext.secureHost;
  },
  getCheckoutUrls: function (context) {
    var secureHost = this.getRedirectURL(context);
    var orderModel = this.getChecoutModel(context);
    return {
      "successUrl": secureHost + defaultRedirect + borderFreeConstants.BF_THANKU_PAGE + "?action=borderFree&orderNo=" + orderModel.orderNumber,
      "pendingUrl": secureHost + defaultRedirect + "?basketId=" + orderModel.orderNumber,
      "failureUrl": secureHost + defaultRedirect,
      "callbackUrl": secureHost + defaultRedirect,
      "basketUrl": secureHost + defaultRedirect,
      "contextChooserPageUrl": secureHost + defaultRedirect,
      "usCartStartPageUrl": secureHost + defaultRedirect,
      "paymentUrls": {
        "payPalUrls": {
          "returnUrl": secureHost + defaultRedirect + "?action=borderFree&orderNo=" + orderModel.orderNumber + "&originalCartId=" + orderModel.originalCartId,
          "cancelUrl": secureHost + defaultRedirect,
          "headerLogoUrl": secureHost + "/resources/images/logo.png"
        }
      }
    };
  },
  getOrderItems: function(){
    
  }

};