var constants = require("mozu-node-sdk/constants");
var getAppInfo = require('mozu-action-helpers/get-app-info');
var borderFreeConstants = require("./constants");
var xmlParser = require("js2xmlparser");
var xmljson = require('xmljson');

var BFEntityClient = require("mozu-node-sdk/clients/platform/entitylists/entity");

var helper = module.exports = {
  createClientFromContext: function (client, context, removeClaims) {
    var c = client(context);
    if (removeClaims)
      c.context[constants.headers.USERCLAIMS] = null;
    return c;
  },
  getEntities: function (context) {
    var self = this;
    return new Promise(function (resolve, reject) {
      // The Promise constructor should catch any errors thrown on
      // this tick. Alternately, try/catch and reject(err) on catch.

      // filter: 'bf_site_id eq ' + siteId,
      self.createClientFromContext(BFEntityClient, context, true)
        .getEntities({
          entityListFullName: self.getBorderFreeEntity(context)
        })
        .then(function (response) {
          // call resolve with results
          console.log(response);
          resolve(response);
        }, function (err) {
          // Call reject on error states
          if (err) {
            return reject(err);
          }
        });
    });
  },
  getBorderFreeEntity: function (context) {
    var appInfo = getAppInfo(context);
    return borderFreeConstants.BORDERFREEID + "@" + appInfo.namespace;
  },
  getExchangeRateData: function (context) {
    var exchangeRate = {
      country_code: context.request.cookies.currency_country_code.value,
      currency_code: context.request.cookies.currency_code_override.value,
      currency_QuoteId: context.request.cookies.currency_QuoteId.value
    };
    return exchangeRate;
  },
  /*set error message in viewData and redirect on default redirect URL*/
  errorHandling: function (errorRes, context) {
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
    return;
  },
  /*Conver JSON TO XML */
  jsonToXmlParser: function (jsonObj) {
    return xmlParser.parse("message", jsonObj);
  },
  xmlToJson: function (xmlObj,context) {
    xmljson.to_json(xmlObj, function (error, dataItems) {
      if (error) {
        this.errorHandling(error,context);
      } else {
        return dataItems;
      }
    });
  }
};