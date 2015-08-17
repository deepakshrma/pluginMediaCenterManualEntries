(function (angular) {
    angular
        .module('mediaCenterContent')
        .controller('ContentMediaCtrl', ['$scope', '$window','Buildfire','MediaContent','$routeParams','Location',function ($scope, $window,Buildfire,MediaContent,$routeParams,Location) {
            var ContentMedia = this;
            ContentMedia.data = {};

            var options = {showIcons: false, multiSelection: false};
            var callback = function (error, result) {
                if (error) {
                    return console.error('Error:', error);
                }
                if (result.selectedFiles && result.selectedFiles.length) {
                    ContentMedia.data.topImage = result.selectedFiles[0];
                    $scope.$digest();
                }
            };

            ContentMedia.selectTopImage = function () {
                Buildfire.imageLib.showDialog(options, callback);
            };

            ContentMedia.removeTopImage = function () {
                ContentMedia.data.topImage = null;
            };
            ContentMedia.selectAudioImage = function () {
                Buildfire.imageLib.showDialog(options,function (error, result) {
                    if (error) {
                        return console.error('Error:', error);
                    }
                    if (result.selectedFiles && result.selectedFiles.length) {
                        ContentMedia.data.image = result.selectedFiles[0];
                        $scope.$digest();
                    }
                });
            };

            ContentMedia.removeAudioImage = function () {
                ContentMedia.data.image = null;
            };

            if($routeParams.id){
                MediaContent.get($routeParams.id).then(function(data){
                    if(data){
                        ContentMedia.data=data;
                    }
                },function(err){
                    console.error('---------------Error while getting data------------',err);
                });
            }

            ContentMedia.done=function(){
                if(ContentMedia.data && ContentMedia.data.id){
                    MediaContent.update(ContentMedia.data.id);
                }
                MediaContent.insert(ContentMedia.data).then(function(data){
                    Location.goToHome();
                },function(err){
                    console.error('---------------Error while inserting data------------',err);
                });
            };
            ContentMedia.delete=function(){};




        }]);
})(window.angular);