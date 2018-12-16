var main = angular.module('CamFaceDetectionApp.controllers.mainCtrl', []);

main.controller('mainCtrl', ['$scope', '$rootScope', '$location', '$anchorScroll', '$timeout',
  function ($scope, $rootScope, $location, $anchorScroll, $timeout) {

    $scope.scrollToBottom = function() {
      $timeout(function(){
        var old = $location.hash();
        $location.hash('detection');
        $anchorScroll();
        $location.hash(old);
      }, 300);
    };


    $scope.blobToUri = function(blob){
      var binary = '';
      var bytes = new Uint8Array( blob );
      console.log(bytes);
      var len = bytes.byteLength;
      for (var i = 0; i < len; i++) {
          binary += String.fromCharCode( bytes[ i ] );
      }
      return btoa(binary);
    }

    $scope.dataURItoBlob = function(dataURI) {
       var byteString;
       if (dataURI.split(',')[0].indexOf('base64') >= 0){
         byteString = atob(dataURI.split(',')[1]);
       }
       else{
         byteString = unescape(dataURI.split(',')[1]);
       }

       var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

       var uarr = new Uint8Array(byteString.length);
       for (var i = 0; i < byteString.length; i++) {
           uarr[i] = byteString.charCodeAt(i);
       }

       return new Blob([uarr], {type:mimeString});
   }

}]);
