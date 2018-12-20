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
var _ = require('lodash'),
  request = require('request'),
  xmljson = require('xmljson');
var borderFree = require("../../borderFree/borderFree.checkout");


var helper = require('../../borderFree/helper');

module.exports = function (context, callback) {
  var selectedCountry = context.request.cookies.currency_country_code.value;

  try {


    helper.getEntities(context)
      .then(function (response) {
        var bfSettings = response.items[0];
        var selectedExData = helper.getExchangeRateData(context);
        if (!_.isUndefined(bfSettings.bf_is_enabled) && _.upperCase(selectedExData.country_code) !== 'US') {
          var kiboCheckoutModel = (context.response.viewData || {}).model,
            kiboSiteContext = context.items.siteContext,
            borderFreeSoapOptions, finalCart = [],
            bCart;

          console.log('modelCheckout', kiboCheckoutModel);

          var borderFreeCart = {
            "header": "",
            "payload": { 
              "setCheckoutSessionRequest": {
                "@": {
                  "id": kiboCheckoutModel.id
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
              "merchantId": bfSettings.bf_merchant_id
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
              "buyerIpAddress": kiboCheckoutModel.ipAddress,
              "affiliateNetwork": {
                "@": {
                  "id": ""
                },
                "merchantId": "",
                "siteId": "",
                "timestamp": new Date().toISOString()
              },
              "checkoutUrls": {
                "successUrl": kiboSiteContext.secureHost + "/borderfree-order-confirmation?action=borderFree&orderNo=" + kiboCheckoutModel.orderNumber,
                "pendingUrl": kiboSiteContext.secureHost + "/cart?basketId=" + kiboCheckoutModel.orderNumber,
                "failureUrl": kiboSiteContext.secureHost + "/cart?status=fail",
                "callbackUrl": kiboSiteContext.secureHost + "/cart?status=callback",
                "basketUrl": kiboSiteContext.secureHost + "/cart?status=basket",
                "contextChooserPageUrl": kiboSiteContext.secureHost + "/cart",
                "usCartStartPageUrl": kiboSiteContext.secureHost + "/cart",
                "paymentUrls": {
                  "payPalUrls": {
                    "returnUrl": kiboSiteContext.secureHost + "/borderfree-order-confirmation?action=borderFree&orderNo=" + kiboCheckoutModel.orderNumber + "&originalCartId=" + kiboCheckoutModel.originalCartId,
                    "cancelUrl": kiboSiteContext.secureHost + "/cart?status=fail",
                    "headerLogoUrl": "https://store.example.com/logo/header.png"
                  }
                }
              }
            },
            "orderProperties": {
              "currencyQuoteId": selectedExData.currency_QuoteId,
              "merchantOrderId": kiboCheckoutModel.orderNumber,
              "merchantOrderRef": ""
            }
          };

          try {
            if (kiboCheckoutModel.items.length > 0) {
              var basketTotalObj = {
                "totalSalePrice": 0,
                "orderDiscount": 0,
                "totalProductExtraShipping": 0,
                "totalProductExtraHandling": 0,
                "totalPrice": 0
              };
              _.each(kiboCheckoutModel.items, function (item, index) {
                // create object for border free from kibo cart
                bCart = {
                  "@": {
                    "sku": ""
                  },
                  "quantity": 0,
                  "pricing": {
                    "listPrice": 0.00,
                    "itemDiscount": 0.00,
                    "salePrice": 0.00,
                    "productExtraShipping": 0.00,
                    "productExtraHandling": 0.00
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
                bCart.display.productUrl = kiboSiteContext.secureHost + '/product/' + item.product.productCode;
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
              }

              // bastket total calcutation
              basketTotalObj.totalPrice = basketTotalObj.totalSalePrice - basketTotalObj.orderDiscount + (basketTotalObj.totalProductExtraShipping + basketTotalObj.totalProductExtraHandling);

              // assign basket total to  domesticSessionObj
              _.assignIn(domesticSessionObj.domesticBasket.basketTotal, basketTotalObj);

              // assign domesticSessionObj data to domesticSession
              _.assignIn(borderFreeCart.payload.setCheckoutSessionRequest.domesticSession, domesticSessionObj);

              borderFreeSoapOptions = {
                method: 'POST',
                url: 'https://sandbox.borderfree.com/checkout/checkoutAPI-v2.srv',
                headers: {
                  'cache-control': 'no-cache',
                  'content-type': 'application/xml',
                  'merchantid': bfSettings.bf_merchant_id,
                  'Authorization': "Basic " + new Buffer(bfSettings.bf_api_username + ":" + bfSettings.bf_api_password).toString("base64")
                },
                'body': borderFree.xmlToJsonParser(borderFreeCart)
              };
              console.log("beforeApi", borderFreeSoapOptions);
              request(borderFreeSoapOptions, function (error, response, body) {
                if (error) {
                  console.log(error);
                  borderFree.errorHandling(error, context, callback);
                  callback();
                } else {
                  xmljson.to_json(body, function (error9, dataItems) {
                    if (error9) {
                      borderFree.errorHandling(error9, context, callback);
                      callback();
                    } else {
                      try {
                        var envoySessionResponse = {};
                        _.find(dataItems.message, function (envyObj) {
                          envoySessionResponse = envyObj.setCheckoutSessionResponse;
                        });
                        console.log(dataItems);

                        if (!_.isUndefined(envoySessionResponse.envoyInitialParams)) {
                          context.response.redirect(envoySessionResponse.envoyInitialParams.fullEnvoyUrl);
                          callback();
                        } else {
                          borderFree.errorHandling(dataItems, context, callback);
                          callback();
                        }
                      } catch (e) {
                        borderFree.errorHandling(e, context, callback);
                        callback();
                      }
                    }
                  });
                }
              });
            }
          } catch (e) {
            borderFree.errorHandling(e, context, callback);
            callback();
          }
        } else {
          // if borderfree not true    
          callback();
        }
      }, function (err) {
        console.log("", err);
        callback();
      });
  } catch (e) {
    console.error("error", e);
    callback(e);
  }

};