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
var request = require("request");
var _ = require("lodash");
var helper = require("../../borderFree/helper");
var bf_Constants = require("../../borderFree/constants");
module.exports = function(context, callback) {
  /*getCountries*/
  try {
    //Get user data from entites
    helper
      .getEntities(context)
      .then(function(response) {
        if (_.isUndefined(response.items)) {
          callback();
        }
        var appConfig = helper.getConfig(_.find(response.items));
        
        var bfRqquestBody =
          '<?xml version="1.0" encoding="utf-8" standalone="yes"?>\n<message>\n  <payload>\n  \t<getLocalizationDataRequest id="67f8c46daf504bbea1cdb796d3399772">\n\t\t<dataTypes>\n    \t\t<dataType  merchantId="' +
          appConfig.merchantId +
          '">COUNTRIES</dataType>\n    \t\t<dataType  merchantId="' +
          appConfig.merchantId +
          '">CURRENCIES</dataType>\n\t\t</dataTypes>\n\t</getLocalizationDataRequest>\n\t</payload>\n</message>';
        var bfOptions = helper.getBFOptions(
          "POST",
          appConfig.environment == 'staging' ? bf_Constants.BF_LOCATION_API_URL : bf_Constants.BF_PROD_LOCATION_API_URL
        );

        request(
          helper.getSoapOptionsFromBF(appConfig, bfRqquestBody, bfOptions),
          function(error, response, body) {
            if (error) {
              helper.errorHandling(error, context);
              callback();
            } else {
              helper
                .xmlToJson(body)
                .then(function(dataItems) {
                  context.response.body = dataItems;
                  callback();
                })
                .catch(function(error) {
                  callback();
                });
            }
          }
        );
      })
      .catch(function(errro) {
        callback();
      });
  } catch (err) {
    callback();
  }
};
