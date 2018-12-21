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
var borderFreeConstants  = require("./constants");


var defaultRedirect = "/cart";

module.exports = {
  /*Common method to create mozu factory client*/
  createClientFromContext: function (client, context, removeClaims) {
    var c = client(context);
    if (removeClaims)
      c.context[mozuConstants.headers.USERCLAIMS] = null;
    return c;
  },

  /* Delete cart items using Kibo Ecomm API.*/
  deleteCartData: function (cancelOrderData, context) {
    var refObj = this;

    // get checkout factory object
    var cartResource = refObj.createClientFromContext(cartResourceFactory, context, true);

    // remove cart Id from response URL
    refObj.removeCartIDFromParam(context);

    cartResource.deleteCart({
      cartId: cancelOrderData.originalCartId
    }).then(function (cartData) {
      console.log("cartData: ", cartData);
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
  getSoapOptionsFromBF: function (bfSettings, borderFreeCart) {
    return {
      method: 'POST',
      url: borderFreeConstants.BF_CHECKOUT_API_URL,
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/xml',
        'merchantid': bfSettings.bf_merchant_id,
        'Authorization': "Basic " + new Buffer(bfSettings.bf_api_username + ":" + bfSettings.bf_api_password).toString("base64")
      },
      'body': helper.jsonToXmlParser(borderFreeCart)
    };
  }
};
