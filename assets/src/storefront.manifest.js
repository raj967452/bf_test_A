module.exports = {
    'http.storefront.routes.getBorderFreeCountries': {
        actionName: 'http.storefront.routes',
        customFunction: require('./domains/storefront/http.storefront.routes.getBorderFreeCountries')
    },
    'http.storefront.routes.getExchangeRates': {
        actionName: 'http.storefront.routes',
        customFunction: require('./domains/storefront/http.storefront.routes.getExchangeRates')
    },
    'http.storefront.pages.global.request.after': {
	    actionName: 'http.storefront.pages.global.request.after',
	    customFunction: require('./domains/storefront/http.storefront.pages.global.request.after')
	  },
	  'http.storefront.pages.checkout.request.after': {
	    actionName: 'http.storefront.pages.checkout.request.after',
	    customFunction: require('./domains/storefront/http.storefront.pages.checkout.request.after')
	  } 
};
