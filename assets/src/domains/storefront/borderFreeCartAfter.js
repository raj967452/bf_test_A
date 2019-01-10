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
var _ = require('lodash');
var borderFree = require("../../borderFree/checkout");
var helper = require('../../borderFree/helper');
var bf_Constants = require("../../borderFree/constants");

module.exports = function (context, callback) {
    try {
        helper.getEntities(context)
            .then(function (response) {
                var kiboCartModel = (context.response.viewData || {}).model;
                var appConfig = helper.getConfig(_.find(response.items));
                if (response.items.length > 0) {
                    helper.disabledPaymentOptFromCart(context, kiboCartModel, appConfig);
                    callback();
                } else {
                    callback();
                }
            }, function (err) {
                console.log("", err);
                callback();
            });
    } catch (error) {
        console.log("Catch Error: ", error);
        callback();
    }
};