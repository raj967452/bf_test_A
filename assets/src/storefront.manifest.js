module.exports = {
    'getBorderFreeCountries': {
        actionName: 'http.storefront.routes',
        customFunction: require('./domains/storefront/getBorderFreeCountries')
    },
    'getExchangeRates': {
        actionName: 'http.storefront.routes',
        customFunction: require('./domains/storefront/getExchangeRates')
    },
    'borderFreeGlobalAfter': {
        actionName: 'http.storefront.pages.global.request.after',
        customFunction: require('./domains/storefront/borderFreeGlobalAfter')
    },
    'borderFreeCheckoutAfter': {
        actionName: 'http.storefront.pages.checkout.request.after',
        customFunction: require('./domains/storefront/borderFreeCheckoutAfter')
    }
};