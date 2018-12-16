var app = angular.module('CamFaceDetectionApp', [
  'ngRoute',
  'ui.bootstrap',
  'ngFileUpload',
  'webcam',
  'CamFaceDetectionApp.controllers.mainCtrl',
  'CamFaceDetectionApp.controllers.homeCtrl',
  'CamFaceDetectionApp.controllers.staticDetectionCtrl',
  'CamFaceDetectionApp.controllers.liveDetectionCtrl'
]);


app.config(['$routeProvider', '$locationProvider', '$httpProvider',
   function($routeProvider, $locationProvider, $httpProvider) {
              $routeProvider.
                when('/', {
                  templateUrl: 'home.html',
                  controller: 'homeCtrl'
                }).
                when('/static-detection', {
                  templateUrl: 'static-detection.html',
                  controller: 'staticDetectionCtrl'
                }).
                when('/live-detection', {
                  templateUrl: 'live-detection.html',
                  controller: 'liveDetectionCtrl'
                })
                .otherwise({redirectTo:'/'});
}]);

app.factory('socket', ['$rootScope', function ($rootScope) {
  var socket = io.connect();

  return {
    on: function (eventName, callback) {
      function wrapper() {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      }

      socket.on(eventName, wrapper);

      return function () {
        socket.removeListener(eventName, wrapper);
      };
    },

    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if(callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
}]);
