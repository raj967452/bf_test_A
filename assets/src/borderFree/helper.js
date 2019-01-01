var _ = require('lodash');
var constants = require("mozu-node-sdk/constants");
var getAppInfo = require('mozu-action-helpers/get-app-info');
var xmlParser = require("js2xmlparser");
var xmljson = require('xmljson');

var Checkout = require("mozu-node-sdk/clients/commerce/checkout");
var BFEntityClient = require("mozu-node-sdk/clients/platform/entitylists/entity");

var bf_Constants = require("./constants");

var helper = module.exports = {
  createClientFromContext: function (client, context, removeClaims) {
    var c = client(context);
    if (removeClaims)
      c.context[constants.headers.USERCLAIMS] = null;
    return c;
  },
  getEntities: function (context) {
    var self = this;
    var siteID = context.items.siteContext.siteId;
    return new Promise(function (resolve, reject) {
      // The Promise constructor should catch any errors thrown on
      // this tick. Alternately, try/catch and reject(err) on catch.
      self.createClientFromContext(BFEntityClient, context, true)
        .getEntities({
          entityListFullName: self.getBorderFreeEntity(context),
          filter: 'id eq ' + siteID
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
  getConfig: function (appConfig) {
    return {
      userName: appConfig.bf_api_username,
      password: appConfig.bf_api_password,
      environment: appConfig.bf_environment || "staging",
      merchantId: appConfig.bf_merchant_id,
      currencyCode: appConfig.bf_merchant_currency_code || 'USD',
      countryCode: appConfig.bf_merchant_country_code || 'US'
    };
  },

  getSoapOptionsFromBF: function (appConfig, borderFreeCart, options) {
    return {
      method: options.type,
      url: options.url,
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/xml',
        'merchantid': appConfig.merchantId,
        'Authorization': "Basic " + new Buffer(appConfig.userName + ":" + appConfig.password).toString('base64')
      },
      'body': borderFreeCart
    };
  },
  getBorderFreeEntity: function (context) {
    var appInfo = getAppInfo(context);
    return bf_Constants.BORDERFREEID + "@" + appInfo.namespace;
  },
  getExchangeRateData: function (context) {
    try {
      var exchangeRate = {
        country_code: 'US',
        currency_code: 'USD',
        currency_QuoteId: 0
      };
      if (!_.isUndefined(context.request.cookies.currency_country_code)) {
        exchangeRate = {
          country_code: context.request.cookies.currency_country_code.value,
          currency_code: context.request.cookies.currency_code_override.value,
          currency_QuoteId: context.request.cookies.currency_QuoteId.value
        };
      }
      return exchangeRate;
    } catch (error) {
      console.log(error);
      return;
    }

  },
  /*set error message in viewData and redirect on default redirect URL*/
  errorHandling: function (errorRes, context) {
    console.log("errorRes: ", errorRes);

    context.response.redirect(bf_Constants.BF_DEFAULT_REDIRECT);
    /*context.response.viewData.model.messages = [{
      'message': "Sorry, an unexpected error occurred. Please refresh the page and try again, or contact Support."
    }];*/
    /*context.response.viewData.model.messages = [
      {'messageType' : "borderFree",'status' : "ACCEPTED", "message":"Thank you for your order!  You will receive an email confirmation."}
    ];*/

    //var errors = _.flatMap(errorRes.message)[0];
    //if (!_.isUndefined(errors.errorResponse.errors)) {
    //errorSet.items[0].message = errors.errorResponse.errors.error[0].details;
    //context.response.body = errorSet;
    // _.each(errors.errorResponse.errors, function(val){

    // })
    //context.response.body.
    //}
    return;
  },
  /*Conver JSON TO XML */
  jsonToXmlParser: function (jsonObj) {
    return xmlParser.parse("message", jsonObj);
  },
  xmlToJson: function (xmlObj, context) {
    return new Promise(function (resolve, reject) {
      xmljson.to_json(xmlObj, function (error, dataItems) {
        if (error) {
          console.log("xmlToJson: ", error);
          this.errorHandling(error, context);
          reject(error);
        } else {
          console.log(dataItems);
          resolve(dataItems);
        }
      });
    });

  },
  getBFOptions: function (rqType, url) {
    return {
      type: rqType,
      url: url
    };
  },
  disabledPaymentOptFromCart: function (context, cartModel, appConfig) {
    var defaultCountry = this.getExchangeRateData(context);
    console.log("defaultCountry", defaultCountry);
    console.log("selectedCountry", appConfig);
    if (!_.isEmpty(defaultCountry.country_code) && !_.isEmpty(defaultCountry.currency_code)) {
      if ((defaultCountry.country_code.toUpperCase() !== appConfig.countryCode.toUpperCase()) || (defaultCountry.currency_code.toUpperCase() !== appConfig.currencyCode.toUpperCase())) {
        cartModel.bf_ext_enabled = true;
      } else {
        cartModel.bf_ext_enabled = false;
      }
    }
    console.log("cartModel.bf_ext_enabled",cartModel.bf_ext_enabled);
    return cartModel;
  },
  getOrderDetails: function (order) {
    var self = this;
    return order;

  },
  getOrder: function (context, id) {
    return this.createClientFromContext(Checkout, context, true).getCheckout({
      checkoutId: id
    });
  }

};