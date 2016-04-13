(function (angular) {
    angular
        .module('mediaCenterWidget')
        .directive('playBtn', function () {
            var linker = function (scope, element, attrs) {
                if (attrs.playBtn == 'true')
                    element.addClass('play-btn');
            }
            return {
                restrict: 'A',
                link: linker
            };
        })
        .directive("buildFireCarousel", ["$rootScope", function ($rootScope) {
            return {
                restrict: 'A',
                link: function (scope, elem, attrs) {
                    $rootScope.$broadcast("Carousel:LOADED");
                }
            };
        }])
        .directive("loadImage", [function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.attr("src", "../../../styles/media/holder-" + attrs.loadImage + ".gif");


                  /*   var elem = $("<img>");
                     elem[0].onload = function () {
                     debugger;
                     element.attr("src", attrs.finalSrc);
                     elem.remove();
                     };*/

                    function changeSrc() {
                        var size = attrs.cropSize.split('X'),
                            width = size[0],
                            height = size[1];
                        buildfire.imageLib.local.cropImage(attrs.finalSrc, {
                            width: width,
                            height: height
                        }, function (e, d) {
                            if (!e) {
                                element.attr("src", d);
                            }
                        });
                        //elem.remove();
                    }

                    scope.$watch(function (val) {
                        return attrs.finalSrc;
                    }, changeSrc, true);
                    elem.attr("src", attrs.finalSrc);
                }
            };
        }]);
})(window.angular, undefined);
