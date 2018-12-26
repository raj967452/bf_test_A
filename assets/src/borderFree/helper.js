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

      // filter: 'id eq ' + siteID,
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
  getSoapOptionsFromBF: function (bfSettings, borderFreeCart, options) {
    return {
      method: options.type,
      url: options.url,
      headers: {
        'cache-control': 'no-cache',
        'content-type': 'application/xml',
        'merchantid': bfSettings.bf_merchant_id,
        'Authorization': "Basic " + new Buffer(bfSettings.bf_api_username + ":" + bfSettings.bf_api_password).toString('base64')
        //'Authorization': "Basic a2lib19mcmVuY2h0b2FzdF9zdGdfYXBpOmJORzdBYWFC"
      },
      'body': borderFreeCart
    };
  },
  getBorderFreeEntity: function (context) {
    var appInfo = getAppInfo(context);
    console.log("appInfo: ", appInfo);
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

    /* context.response.viewData.model.messages = [
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
  /*getOrder: function (context, id) {
    return this.createClientFromContext(Checkout, context, true).getCheckout({
      checkoutId: id
    });
  }*/
  getBFOptions: function (rqType, url) {
    return {
      type: rqType,
      url: url
    };
  },
  disabledPaymentOptFromCart: function (context, cartModel) {
    var defaultCountry = this.getExchangeRateData(context);
    console.log("defaultCountry",defaultCountry);

    if (!_.isEmpty(defaultCountry.country_code) && defaultCountry.country_code.toUpperCase() !== 'US') {
      cartModel.bf_ext_enabled = true;
    } else {
      cartModel.bf_ext_enabled = false;
    }
    return cartModel;
  }
};