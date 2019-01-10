module.exports = {
    'getBorderFreeCountries': {
        actionName: 'http.storefront.routes',
        customFunction: require('./domains/storefront/getBorderFreeCountries')
    },
    'getBorderFreeExchangeRates': {
        actionName: 'http.storefront.routes',
        customFunction: require('./domains/storefront/getBorderFreeExchangeRates')
    },
    'borderFreeGlobalAfter': {
        actionName: 'http.storefront.pages.global.request.after',
        customFunction: require('./domains/storefront/borderFreeGlobalAfter')
    },
    'borderFreeCheckoutAfter': {
        actionName: 'http.storefront.pages.checkout.request.after',
        customFunction: require('./domains/storefront/borderFreeCheckoutAfter')
    },
    'borderFreeCartAfter': {
        actionName: 'http.storefront.pages.cart.request.after',
        customFunction: require('./domains/storefront/borderFreeCartAfter')
    }
};