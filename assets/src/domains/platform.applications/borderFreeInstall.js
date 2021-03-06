/*
 * This custom function was generated by the Actions Generator
 * in order to enable the other custom functions in this app
 * upon installation into a tenant.
 */

var ActionInstaller = require('mozu-action-helpers/installers/actions');
var constants = require("mozu-node-sdk/constants");
var _ = require("underscore");

function AppInstall(context, callback) {
  var self = this;
  self.ctx = context;
  self.cb = callback;

  self.initialize = function () {
    console.log(context);
    console.log("Getting tenant", self.ctx.apiContext.tenantId);
    var tenant = context.get.tenant();
    enableBorderFreeWorkflow(tenant);
  };

  function enableBorderFreeWorkflow(tenant) {

    try {
      console.log("Installing BorderFree settings", tenant);

      var tasks = tenant.sites.map(
        function (site) {
          return addCustomRoutes(context, tenant);
        }
      );

      Promise.all(tasks).then(function (result) {
        console.log("BorderFree definition installed");        
      }, function (error) {
        self.cb(error);
      });
    } catch (e) {
      console.error("BorderFree install error", e);
      self.cb(e);
    }
  }


  function addCustomRoutes(context, tenant) {
    var tasks = tenant.sites.map(
      function (site) {
        var customRoutesApi = require("mozu-node-sdk/clients/commerce/settings/general/customRouteSettings")();
        customRoutesApi.context[constants.headers.SITE] = site.id;
        return customRoutesApi.getCustomRouteSettings().then(
          function (customRoutes) {
            return appUpdateCustomRoutes(customRoutesApi, customRoutes);
          },
          function (err) {
            console.log("custom routes get error", err);
            return appUpdateCustomRoutes(customRoutesApi, {
              routes: []
            });
          }
        );
      }
    );

    Promise.all(tasks).then(function (result) {
      console.log("BorderFree custom route installed");
      enableActions(context, tenant);
    }, function (error) {
      console.log("arc i", error);
      self.cb(error);
    });

  }

  function appUpdateCustomRoutes(customRoutesApi, customRoutes) {
    console.log(customRoutes);
    console.log("route array size", _.size(customRoutes.routes));
    //Add / Update custom routes for BorderFree
    customRoutes = getRoutes(customRoutes, "borderFree/getBorderFreeCountries", "getBorderFreeCountries");
    customRoutes = getRoutes(customRoutes, "borderFree/getBorderFreeExchangeRates", "getBorderFreeExchangeRates");
    return customRoutesApi.updateCustomRouteSettings(customRoutes);

  }

  function enableActions() {
    console.log("installing code actions");
    var installer = new ActionInstaller({
      context: self.ctx.apiContext
    });

    installer.enableActions(self.ctx, null, {
      
      "borderFreeCartAfter": function (settings) {
        settings = settings || {};
        settings.timeoutMilliseconds = settings.timeoutMilliseconds || 30000;
        return settings;
      },
      "borderFreeCheckoutAfter": function (settings) {
        settings = settings || {};
        settings.timeoutMilliseconds = settings.timeoutMilliseconds || 30000;
        return settings;
      },
      "borderFreeGlobalAfter": function (settings) {
        settings = settings || {};
        settings.timeoutMilliseconds = settings.timeoutMilliseconds || 30000;
        return settings;
      }

    }).then(self.cb.bind(null, null), self.cb);
  }

  function getRoutes(customRoutes, template, action) {
    var route = {
      "template": template,
      "internalRoute": "Arcjs",
      "functionId": action,
    };

    var index = _.findIndex(customRoutes.routes, function (route) {
      return route.functionId == action;
    });
    console.log("Action index " + action, index);
    if (index <= -1)
      customRoutes.routes[_.size(customRoutes.routes)] = route;
    else
      customRoutes.routes[index] = route;

    return customRoutes;

  }
}

module.exports = function (context, callback) {
  try {
    var appInstall = new AppInstall(context, callback);
    appInstall.initialize();
  } catch (e) {
    callback(e);
  }
};
