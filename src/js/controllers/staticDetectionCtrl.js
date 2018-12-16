var staticDetectionCtrl = angular.module('CamFaceDetectionApp.controllers.staticDetectionCtrl', [
  'CamFaceDetectionApp.services.UploadServ'
]);

staticDetectionCtrl.controller('staticDetectionCtrl', ['$scope', 'UploadServ', '$rootScope',
  function ($scope, UploadServ, $rootScope) {

    $scope.showSnap = false;
    $scope.showBtn = false;

    $scope.myChannel = {
     // the fields below are all optional
     videoHeight: 800,
     videoWidth: 600,
     video: null // Will reference the video element on success
   };

    $scope.onStream = function (stream) {
      console.log(stream);
    };

    $scope.onError = function (err) {
      console.log(err);
    };
    $scope.onSuccess = function () {
      $rootScope.$apply(function () {
        $scope.showBtn = true;
      });
    };


    function uploadPic(file) {

      //convert blob to image file
      var imgData = new File([file], 'fileName.png', {type: "image/png"});

      var uploader = UploadServ.uploadImage(imgData);

      uploader.then(function (response) {
        $scope.myImage = $scope.blobToUri(response.data.buffer.data);

      }, function (response) {
       if (response.status > 0)
          console.log(response);
      }, function (evt) {
       // Math.min is to fix IE which reports 200% sometimes
       var progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
      });
     };

    $scope.takeScreenShot = function() {
       var canvas = document.querySelector('#canvas');
       if (canvas){
         canvas.width = $scope.myChannel.video.width;
         canvas.height = $scope.myChannel.video.height;
         var canvasCtx = canvas.getContext('2d');

         canvasCtx.drawImage($scope.myChannel.video, 0, 0, canvas.width, canvas.height);
         $scope.showSnap = true;

         var fileUri = canvas.toDataURL();
         uploadPic($scope.dataURItoBlob(fileUri));
         $scope.scrollToBottom();
       }
   };



}]);
