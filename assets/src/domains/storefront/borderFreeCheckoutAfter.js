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
var request = require('request');
var xmljson = require('xmljson');
var borderFree = require("../../borderFree/checkout");
var helper = require('../../borderFree/helper');
var bf_Constants = require("../../borderFree/constants");

module.exports = function (context, callback) {
  try {
    // get borderfree entities data and set borderfree checkout based on country and currency 
    helper.getEntities(context)
      .then(function (response) {
        // if borderfree true    
        var selectedExData = helper.getExchangeRateData(context);
        var appConfig = helper.getConfig(_.find(response.items));
        // console.log("selectedExData", selectedExData);
        // console.log("appConfig", appConfig);
        try {
          if (!_.isEmpty(selectedExData.country_code) && !_.isEmpty(selectedExData.currency_code) && response.items.length > 0) {
            if ((selectedExData.country_code.toUpperCase() !== appConfig.countryCode.toUpperCase())) {
              var kiboCheckoutModel = (context.response.viewData || {}).model,
                bCart;
              var sessionData = borderFree.getCheckoutSessionData(context);
              // console.log("sessionData: ", sessionData);
              // console.log('modelCheckout', kiboCheckoutModel);
              var borderFreeCart = {
                "header": "",
                "payload": {
                  "setCheckoutSessionRequest": {
                    "@": {
                      "id": sessionData.id
                    },
                    "domesticSession": {},
                    "buyerSession": {
                      "shipToAddress": {
                        "@": {
                          "isPoBox": "false",
                          "isReadOnly": "false"
                        },
                        "firstName": "",
                        "middleInitials": "",
                        "lastName": "",
                        "addressLine1": "",
                        "addressLine2": [],
                        "addressLine3": [],
                        "city": "",
                        "region": "",
                        "postalCode": "",
                        "countryCode": selectedExData.country_code,
                        "email": "",
                        "primaryPhone": "",
                        "secondaryPhone": [],
                        "cpf": []
                      },
                      "billToAddress": {
                        "@": {
                          "isPoBox": "false"
                        },
                        "firstName": "",
                        "middleInitials": "",
                        "lastName": "",
                        "addressLine1": "",
                        "city": "",
                        "region": "",
                        "postalCode": "",
                        "countryCode": "",
                        "email": "",
                        "primaryPhone": "",
                        "secondaryPhone": []
                      },
                      "buyerPreferences": {
                        "language": "EN",
                        "buyerCurrency": selectedExData.currency_code
                      }
                    }
                  }
                }
              };
              var domesticSessionObj = {
                "@": {
                  "merchantId": appConfig.merchantId
                },
                "domesticBasket": {
                  "basketItems": {
                    "basketItem": []
                  },
                  "basketTotal": {},
                  "customData": ""
                },
                "domesticShippingMethod": {
                  "domesticShippingPrice": 0.00,
                  "domesticHandlingPrice": 0.00,
                  "extraInsurancePrice": 0.00,
                  "deliveryPromiseMinimum": 0,
                  "deliveryPromiseMaximum": 0
                },
                "sessionDetails": {
                  "buyerSessionId": context.items.pageContext.user.userId,
                  "buyerIpAddress": sessionData.ipAddress,
                  "affiliateNetwork": {
                    "@": {
                      "id": ""
                    },
                    "merchantId": "",
                    "siteId": "",
                    "timestamp": new Date().toISOString()
                  },
                  "checkoutUrls": borderFree.getCheckoutUrls(context)
                },
                "orderProperties": {
                  "currencyQuoteId": selectedExData.currency_QuoteId,
                  "merchantOrderId": sessionData.orderNumber,
                  "merchantOrderRef": ""
                }
              };
              if (kiboCheckoutModel.items.length > 0) {
                var basketTotalObj = {
                  "totalSalePrice": 0,
                  "orderDiscount": 0,
                  "totalProductExtraShipping": 0,
                  "totalProductExtraHandling": 0,
                  "totalPrice": 0
                };
                // create borderfree basket items from checkout model
                _.each(kiboCheckoutModel.items, function (item, index) {
                  item.weightedOrderShipping = _.isUndefined(item.weightedOrderShipping) ? 0 : item.weightedOrderShipping;
                  item.weightedOrderHandlingFee = _.isUndefined(item.weightedOrderHandlingFee) ? 0 : item.weightedOrderHandlingFee;
                  // create object for border free from kibo cart
                  bCart = {
                    "@": {
                      "sku": ""
                    },
                    "quantity": 0,
                    "pricing": {
                      "listPrice": 0,
                      "itemDiscount": 0,
                      "salePrice": 0,
                      "productExtraShipping": 0,
                      "productExtraHandling": 0
                    },
                    "display": {
                      "name": "",
                      "description": "",
                      "productUrl": "",
                      "imageUrl": "",
                      "color": "",
                      "size": "",
                      "attributes": "",
                      "inventory": ""
                    },
                    "customData": ""
                  };

                  if (item.product.variationProductCode) {
                    bCart['@'].sku = item.product.variationProductCode;
                  } else {
                    bCart['@'].sku = item.product.productCode;
                  }

                  bCart.quantity = item.quantity;
                  if (item.unitPrice.saleAmount) {
                    bCart.pricing.listPrice = item.unitPrice.saleAmount;
                  } else {
                    bCart.pricing.listPrice = item.unitPrice.listAmount;
                  }
                  if (!_.isEmpty(item.productDiscounts)) {
                    if (!item.productDiscounts[0].excluded) {
                      bCart.pricing.itemDiscount = item.productDiscounts[0].impactPerUnit;
                      bCart.pricing.salePrice = (item.unitPrice.listAmount - item.productDiscounts[0].impactPerUnit);
                    }
                  } else {
                    if (item.unitPrice.saleAmount) {
                      bCart.pricing.salePrice = item.unitPrice.saleAmount;
                    } else {
                      bCart.pricing.salePrice = item.unitPrice.listAmount;
                    }
                  }

                  bCart.pricing.productExtraShipping = item.weightedOrderShipping;
                  bCart.pricing.productExtraHandling = item.weightedOrderHandlingFee;
                  bCart.display.name = item.product.name;
                  bCart.display.description = item.product.description;
                  bCart.display.productUrl = sessionData.secureHost + '/product/' + item.product.productCode;
                  bCart.display.imageUrl = 'https:' + item.product.imageUrl;
                  bCart.display.attributes = "";
                  bCart.display.inventory = "";

                  _.each(item.product.options, function (option, OpIn) {
                    if (_.toLower(option.name) === 'color') {
                      bCart.display.color = option.value;
                    } else if (_.toLower(option.name) === 'size') {
                      bCart.display.size = option.value;
                    }
                  });
                  if (!_.isEmpty(item.productDiscount)) {
                    bCart.customData = item.productDiscount.couponCode;
                  }
                  // calculate bastket total Sale Price, shipping and handling calcutation
                  basketTotalObj.totalSalePrice += (bCart.pricing.salePrice * item.quantity);
                  basketTotalObj.totalProductExtraShipping += (item.weightedOrderShipping * item.quantity);
                  basketTotalObj.totalProductExtraHandling += (item.weightedOrderHandlingFee * item.quantity);

                  domesticSessionObj.domesticBasket.basketItems.basketItem.push(bCart);
                });

                if (!_.isEmpty(kiboCheckoutModel.orderDiscounts)) {
                  var orderDiscountAmount = (basketTotalObj.totalSalePrice - kiboCheckoutModel.orderDiscounts[0].impact);
                  if (_.gte(orderDiscountAmount, 0) && !kiboCheckoutModel.orderDiscounts[0].excluded) {
                    basketTotalObj.orderDiscount = kiboCheckoutModel.orderDiscounts[0].impact;
                  }
                  domesticSessionObj.domesticBasket.customData = kiboCheckoutModel.orderDiscounts[0].couponCode;
                }

                // bastket total calcutation
                basketTotalObj.totalPrice = basketTotalObj.totalSalePrice - basketTotalObj.orderDiscount + (basketTotalObj.totalProductExtraShipping + basketTotalObj.totalProductExtraHandling);

                // assign basket total to  domesticSessionObj
                _.assignIn(domesticSessionObj.domesticBasket.basketTotal, basketTotalObj);

                // assign domesticSessionObj data to domesticSession
                _.assignIn(borderFreeCart.payload.setCheckoutSessionRequest.domesticSession, domesticSessionObj);
                var bfRqquestBody = helper.jsonToXmlParser(borderFreeCart);
                var bfOptions = helper.getBFOptions('POST', appConfig.environment == 'staging' ? bf_Constants.BF_CHECKOUT_API_URL : bf_Constants.BF_PROD_CHECKOUT_API_URL);
                // console.log("borderFreeCart: ", borderFreeCart);
                // request borderfree with XML 
                request(helper.getSoapOptionsFromBF(appConfig, bfRqquestBody, bfOptions), function (error, response, body) {
                  // console.log("bfRqquestBody: ", bfRqquestBody);
                  // console.log("response.statusCode: ", response.statusCode);
                  if (error) {
                    helper.errorHandling(error, context);
                    callback();
                  } else {
                    helper.xmlToJson(body).then(function (result) {
                      try {
                        // console.log("result: ", result);
                        if (!_.isUndefined(result.message.payload.setCheckoutSessionResponse)) {
                          // set envoy session URL and redirect to international checkout page
                          var envoySessionResponse = {};
                          _.find(result.message, function (envyObj) {
                            envoySessionResponse = envyObj.setCheckoutSessionResponse;
                          });
                          var domain = appConfig.environment == 'staging' ? bf_Constants.BF_STAG_DOMAIN : bf_Constants.BF_PROD_DOMAIN;
                          var encodeEnvoyURL = new Buffer(envoySessionResponse.envoyInitialParams.fullEnvoyUrl).toString('base64');
                          context.response.redirect('/international-checkout?ooStatus=CHECKOUT&fullEnvoyUrl=' + encodeEnvoyURL + '&checkoutDomain1=' + domain.domain1 + '&checkoutDomain2=' + domain.domain2);

                          /*kiboCheckoutModel.borderFreeData = {
                            isBorderEnable: true,
                            envoyResponse: envoySessionResponse.envoyInitialParams,
                            checkoutDomain: appConfig.environment == 'staging' ? bf_Constants.BF_STAG_DOMAIN : bf_Constants.BF_PROD_DOMAIN
                          };*/
                          callback();
                        } else {
                          helper.errorHandling(result, context);
                          callback();
                        }
                      } catch (error) {
                        helper.errorHandling(error, context);
                        callback();
                      }
                    }, function (error) {
                      helper.errorHandling(error, context);
                      callback();
                    }).catch(function (error) {
                      helper.errorHandling(error, context);
                      callback();
                    });
                  }
                });
              }
            } else {
              callback();
            }
          } else {
            callback();
          }
        } catch (error) {
          callback();
        }
      }, function (err) {
        callback();
      });
  } catch (e) {
    callback(e);
  }

};