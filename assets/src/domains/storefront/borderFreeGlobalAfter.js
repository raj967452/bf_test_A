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

module.exports = function (context, callback) {
  var borderFreeResponse = JSON.parse(JSON.stringify(context.request.query));

  try {
    if (borderFreeResponse.action === 'borderFree') {
      if ((borderFreeResponse.ppStatus == 'PENDING' || borderFreeResponse.ppStatus == 'ACCEPTED') && borderFreeResponse.originalCartId) {
        /*context.response.viewData.model.messages = [{
          'messageType': "borderFree",
          'status': borderFreeResponse.ppStatus,
          "message": "Thank you for your order!  You will receive an email confirmation."
        }]; */
        borderFree.deleteCartData(borderFreeResponse, context, callback);   
        callback();
      } else if (borderFreeResponse.ppStatus === 'FAILED') {
        context.response.viewData.model.messages = [{
          'message': "Sorry, an unexpected error occurred. Please refresh the page and try again, or contact Support."
        }];
        callback();
      } else {
        callback();
      }
    } else {
      callback();
    }
  } catch (error) {
    console.log("Error in border free checkout: ", error);
    callback();
  }
};