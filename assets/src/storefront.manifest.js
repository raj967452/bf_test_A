module.exports = {
    'http.storefront.routes.getBorderFreeCountries': {
        actionName: 'http.storefront.routes',
        customFunction: require('./domains/storefront/http.storefront.routes.getBorderFreeCountries')
    },
    'http.storefront.routes.getExchangeRates': {
        actionName: 'http.storefront.routes',
        customFunction: require('./domains/storefront/http.storefront.routes.getExchangeRates')
    } 
};
