var liveDetectionCtrl = angular.module('CamFaceDetectionApp.controllers.liveDetectionCtrl', []);

liveDetectionCtrl.controller('liveDetectionCtrl', ['$scope', 'socket',
  function ($scope, socket) {

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

      var canvas = document.createElement('canvas');
      canvas.height = $scope.myChannel.video.height;
      canvas.width = $scope.myChannel.video.width;

      if (canvas) {
        var canvasCtx = canvas.getContext('2d');

        setInterval(function () {
          canvasCtx.drawImage($scope.myChannel.video, 0, 0, canvas.width, canvas.height);
          var fileUri = canvas.toDataURL();
          socket.emit('stream', $scope.dataURItoBlob(fileUri));
        }, 200);

        socket.on('faces', function (data) {
          $scope.myStream = data;
        });
      }
    };






}]);
