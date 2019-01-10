/**
 * Implementation for http.storefront.routes


 * HTTP Actions all receive a similar context object that includes
 * `request` and `response` objects. These objects are similar to
 * http.IncomingMessage objects in NodeJS.

{
  configuration: {},
  request: http.ClientRequest,
  response: http.ClientResponse
}

 * Call `response.end()` to end the response early.
 * Call `response.set(headerName)` to set an HTTP header for the response.
 * `request.headers` is an object containing the HTTP headers for the request.
 * 
 * The `request` and `response` objects are both Streams and you can read
 * data out of them the way that you would in Node.

 */
var cartResourceFactory = require('mozu-node-sdk/clients/commerce/cart');
var mozuConstants = require("mozu-node-sdk/constants");
var borderFree = require("../../borderFree/checkout");
var helper = require("../../borderFree/helper");

module.exports = function (context, callback) {
  var borderFreeResponse = JSON.parse(JSON.stringify(context.request.query));
  try {
    if (borderFreeResponse.action === 'borderFree') {
      if ((borderFreeResponse.ppStatus == 'PENDING' || borderFreeResponse.ppStatus == 'ACCEPTED' || borderFreeResponse.ppStatus.toUpperCase() == 'OK') && borderFreeResponse.originalCartId) {
        borderFree.deleteCartData(borderFreeResponse, context, callback);   
        callback();
      } else if (borderFreeResponse.ppStatus === 'REJECTED' || borderFreeResponse.ppStatus.toUpperCase() == "CANCEL") {
        helper.errorHandling("failure", context);
        callback();
      } else {
        callback();
      }
    } else {
      callback();
    }
  } catch (error) {
    helper.errorHandling("unexpected", context);
    callback();
  }
};