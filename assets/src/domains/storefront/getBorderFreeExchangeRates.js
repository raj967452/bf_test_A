/**
 * Implementation for http.storefront.pages.global.request.after


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
var currencyResource = require("mozu-node-sdk/clients/commerce/catalog/admin/currencyLocalization");
var helper = require("../../borderFree/helper");
var _ = require("lodash");
module.exports = function(context, callback) {
  /*getCurrencyExchangeRates*/
  try {
    var currencyCode = context.request.body.currencyCode,
      toCurrencyCode = context.request.body.toCurrencyCode;
      console.log("op",currencyCode, toCurrencyCode);
    if(_.isUndefined(currencyCode) || _.isUndefined(toCurrencyCode)){
      callback();
    }

    helper.createClientFromContext(currencyResource, context, true)
    .getCurrencyExchangeRate({
        currencyCode: currencyCode,
        toCurrencyCode: toCurrencyCode
      })
      .then(
        function(resp) {
          context.response.body = JSON.stringify(resp);
          callback();
        },
        function(err) {
          context.response.body = err;
          console.log(JSON.stringify(err));
          callback();
        }
      );
  } catch (err) {
    context.response.body = err;
    callback();
  }
};
