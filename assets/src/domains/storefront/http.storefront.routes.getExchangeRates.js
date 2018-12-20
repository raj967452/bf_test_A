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
module.exports = function(context, callback) {
  console.log('testing..!!');
  console.info('info testing..!!');
  /*getCurrencyExchangeRates*/
  try {
   // console.info(context);
    // context.response.body = JSON.stringify(context.request.body);
    // callback();
    var currencyObj = require("mozu-node-sdk/clients/commerce/catalog/admin/currencyLocalization")(
      context.apiContext
    );
    currencyObj.context["user-claims"] = null;
    var currencyCode = context.request.body.currencyCode,
    toCurrencyCode = context.request.body.toCurrencyCode;
    //Get checkout data to pass information to Ingenico APIs
    currencyObj.getCurrencyExchangeRate({currencyCode:currencyCode, toCurrencyCode:toCurrencyCode}).then(
      function(resp) {
        console.log(resp);
        // context.response.body = tts;
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
