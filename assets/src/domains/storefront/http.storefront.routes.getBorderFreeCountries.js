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
var xmljson = require("xmljson");

module.exports = function(context, callback) {
  console.log('test!!');
  /*getCountries*/
  try {

    var options = {
      method: "POST",
      url: "https://sandbox.borderfree.com/embassy/localizationAPI.srv",
      headers: {
        "cache-control": "no-cache",
        "Content-Type": "application/xml",
        authorization: "Basic a2lib19mcmVuY2h0b2FzdF9zdGdfYXBpOmJORzdBYWFC"
      },
      body: '<?xml version="1.0" encoding="utf-8" standalone="yes"?>\n<message>\n  <payload>\n  \t<getLocalizationDataRequest id="67f8c46daf504bbea1cdb796d3399772">\n\t\t<dataTypes>\n    \t\t<dataType  merchantId="5114">COUNTRIES</dataType>\n    \t\t<dataType  merchantId="5114">CURRENCIES</dataType>\n\t\t</dataTypes>\n\t</getLocalizationDataRequest>\n\t</payload>\n</message>' };

    request(options, function(error, response, body) {
      if (error) {
        throw new Error(error);
      } else {
        xmljson.to_json(body, function(errorObj, dataItems) {
          if (errorObj) {
            context.response.body = errorObj;
            callback();
          } else {
            context.response.body = dataItems;
            console.log(response);
            callback();
          }
        });
      }
    });
  } catch (err) {
    context.response.body = err;
    callback();
  }
};
