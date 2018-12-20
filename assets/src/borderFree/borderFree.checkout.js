/*
 * Implementation for borderFree.checkout.js
 * Description: Module to get common functions at one place
 */

/**
 * Border Free Checkout factory object to perform various operations 
 */

var cartResourceFactory = require('mozu-node-sdk/clients/commerce/cart');
/**Get mozu sdk constants */
var xmlParser = require("js2xmlparser");
var xmljson = require('xmljson');

var mozuConstants = require("mozu-node-sdk/constants");
var errorSet = require("../borderFree/errors.json");
var helper = require('./helper');


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
  deleteCartData: function (context, cancelOrderData, callback) {
    var refObj = this;

    // get checkout factory object
    var cartResource = refObj.createClientFromContext(cartResourceFactory, context, true);

    // remove cart Id from response URL
    refObj.removeCartIDFromParam(context, callback);

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
      context.response.redirect(clean_uri);
      callback();
    } else {
      callback();
    }
  },
  errorHandling: function (errorRes, context, callback) {
    console.log(errorRes);
    context.response.viewData.model.messages = [{
      'message': "Error in border free"
    }];
    context.response.redirect(defaultRedirect);

    //var errors = _.flatMap(errorRes.message)[0];
    //if (!_.isUndefined(errors.errorResponse.errors)) {
    //errorSet.items[0].message = errors.errorResponse.errors.error[0].details;
    //context.response.body = errorSet;
    // _.each(errors.errorResponse.errors, function(val){

    // })
    //context.response.body.
    //}
    console.log(errorRes);
    callback();
  },
  xmlToJsonParser: function (xmlObj) {
    return xmlParser.parse("message", xmlObj);
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
  }
};
