/*
 * Implementation for borderFree.checkout.js
 * Description: Module to get common functions at one place
 */

/**
 * Border Free Checkout factory object to perform various operations 
 */

var cartResourceFactory = require('mozu-node-sdk/clients/commerce/cart');
/**Get mozu sdk constants */
var mozuConstants = require("mozu-node-sdk/constants");
var errorSet = require("../borderFree/errors.json");

module.exports = {
  /*Common method to create mozu factory client*/
  createClientFromContext: function (client, context, removeClaims) {
    var c = client(context);
    if (removeClaims)
      c.context[mozuConstants.headers.USERCLAIMS] = null;
    return c;
  },

  /* Delete cart items using Kibo Ecomm API.*/
  deleteCartData: function (context, cancelOrderData, callback) {
    var refObj = this;
    // get checkout factory object
    var cartResource = refObj.createClientFromContext(cartResourceFactory, context, true);
    // remove cart Id from response URL
    
    cartResource.deleteCart({
      cartId: cancelOrderData.originalCartId
    }).then(function (cartData) {
      console.log("cartData: ", cartData);
      callback();
    }, function (err1) {
      console.log("err1: ", err1);
      callback();
    });
  },
  removeCartIDFromParam: function (context, callback) {
    var uri = context.request.url;
    if (uri.indexOf("&originalCartId") > 0) {
      var clean_uri = uri.replace(new RegExp('originalCartId' + "=\\w+"), "").replace("?&", "?").replace("&&", "&");
      context.request.url = clean_uri;
      console.log(clean_uri);
      //window.history.replaceState({}, document.title, clean_uri);
      callback();
    } else {
      callback();
    }
  }
};
