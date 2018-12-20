var mozuConstants = require("mozu-node-sdk/constants");
var getAppInfo = require('mozu-action-helpers/get-app-info');
var borderFreeConstants = require("./constants");

var helper = module.exports = {
  createClientFromContext: function (client, context, removeClaims) {
    var c = client(context);
    if (removeClaims)
      c.context[constants.headers.USERCLAIMS] = null;
    return c;
  },
  getBorderFreeSetting: function (context,callback) {
    try {
      
    } catch (e) {
      console.log("e: ", e);
      callback();
    }
  },
  getBorderFreeEntity: function(context) {
		var appInfo = getAppInfo(context);
    return borderFreeConstants.BORDERFREEID+"@"+appInfo.namespace;
	},
  getExchangeRateData: function(context){
    var exchangeRate = {
      country_code: context.request.cookies.currency_country_code.value,
      currency_code: context.request.cookies.currency_code_override.value,
      currency_QuoteId: context.request.cookies.currency_QuoteId.value
    };
    return exchangeRate;
  }  
};
