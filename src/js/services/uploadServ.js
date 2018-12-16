var uploadServ = angular.module('CamFaceDetectionApp.services.UploadServ', []);

uploadServ.service('UploadServ',['$http', 'Upload',
   function($http,Upload) {
      this.uploadImage = function(file) {
        return Upload.upload({
          url: '/api/images/upload',
          file: file
        });
    }
}]);
