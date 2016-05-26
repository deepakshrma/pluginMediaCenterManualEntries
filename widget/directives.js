(function (angular) {
    angular
        .module('mediaCenterWidget')
        .directive('playBtn', function () {
            var linker = function (scope, element, attrs) {
                if (attrs.playBtn == 'true')
                    element.addClass('play-btn');
            };
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
        .directive("viewSwitcher", ["ViewStack", "$rootScope", '$compile', "$templateCache",
            function (ViewStack, $rootScope, $compile, $templateCache) {
                return {
                    restrict: 'AE',
                    link: function (scope, elem, attrs) {
                        var views = 0;
                        manageDisplay();
                        $rootScope.$on('VIEW_CHANGED', function (e, type, view) {
                            console.log('VIEW_CHANGED event recieved in directive-----------',type,view);
                            if (type === 'PUSH') {
                                var newScope = $rootScope.$new();
                                newScope.currentItemListLayout = "templates/layouts/" + view.template + ".html";

                                var _newView = '<div  id="' + view.template + '" ><div class="slide content" data-back-img="{{backgroundImage}}" ng-if="currentItemListLayout" ng-include="currentItemListLayout"></div></div>';
                                if (view.params && view.params.controller) {
                                    _newView = '<div id="' + view.template + '" ><div class="slide content" data-back-img="{{backgroundImage}}" ng-if="currentItemListLayout" ng-include="currentItemListLayout" ng-controller="' + view.params.controller + '" ></div></div>';
                                }
                                var parTpl = $compile(_newView)(newScope);
                                if (view.params && view.params.shouldUpdateTemplate) {
                                    newScope.$on("ITEM_LIST_LAYOUT_CHANGED", function (evt, layout, needDigest) {
                                        newScope.currentItemListLayout = "templates/layouts/" + layout + ".html";
                                        if (needDigest) {
                                            newScope.$digest();
                                        }
                                    });
                                    newScope.$on("ITEM_LAYOUT_CHANGED", function (evt, layout, needDigest) {
                                        newScope.currentItemListLayout = "templates/layouts/" + layout + ".html";
                                        if (needDigest) {
                                            newScope.$digest();
                                        }
                                    });
                                }
                                $(elem).append(parTpl);
                                views++;

                            } else if (type === 'POP') {
                                var _elToRemove = $(elem).find('#' + view.template),
                                    _child = _elToRemove.children("div").eq(0);

                                _child.addClass("ng-leave ng-leave-active");
                                _child.one("webkitTransitionEnd transitionend oTransitionEnd", function (e) {
                                    _elToRemove.remove();
                                    views--;
                                });

                                //$(elem).find('#' + view.template).remove();
                            }
                            else if (type === 'POPALL') {
                                console.log(view);
                                angular.forEach(view, function (value, key) {
                                    $(elem).find('#' + value.template).remove();
                                });
                                views = 0;
                            }
                            manageDisplay();
                        });

                        function manageDisplay() {
                            if (views) {
                                $(elem).removeClass("ng-hide");
                            } else {
                                $(elem).addClass("ng-hide");
                            }
                        }

                    }
                };
            }])
        .directive('backImg', ["$filter", "$rootScope", function ($filter, $rootScope) {
            return function (scope, element, attrs) {
                attrs.$observe('backImg', function (value) {
                    console.log('bgimag', value);
                    var img = '';
                    if (value) {
                        img = $filter("cropImage")(value, window.innerWidth, window.innerHeight, true);
                        console.log('***********************New---*******************$rootScope.deviceWidth,$rootScope.deviceHeight: window.innerHeight:', $rootScope.deviceWidth, $rootScope.deviceHeight, window.innerHeight, window.innerWidth, window.outerHeight, window.outerWidth);
                        element.attr("style", 'background:url(' + img + ') !important;background-size: cover !important');
                        /* element.css({
                         'background-size': 'cover !important'
                         });*/
                    }
                    else {
                        // element.attr("style", 'background-color:white');
                        element.addClass('backgroundColorTheme');
                        element.css({
                            'background-size': 'cover !important'
                        });
                    }
                });
            };
        }])
        .directive("loadImage", [function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    element.attr("src", "../../../styles/media/holder-" + attrs.loadImage + ".gif");


                    var elem = $("<img>");
                    elem[0].onload = function () {
                        element.attr("src", attrs.finalSrc);
                        elem.remove();
                    };

                    function changeSrc(info) {
                        element.attr("src", attrs.finalSrc);
                        elem.remove();
                    }
                   scope.$watch(function(val){
                       return attrs.finalSrc;
                   }, changeSrc, true);
                    elem.attr("src", attrs.finalSrc);
                }
            };
        }]);
})(window.angular, undefined);
