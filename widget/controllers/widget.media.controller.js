(function (angular, window) {
    angular
        .module('mediaCenterWidget')
        .controller('WidgetMediaCtrl', ['$scope', '$window', 'Messaging', 'Buildfire', 'COLLECTIONS', 'EVENTS', '$timeout', "$sce", "DB", 'PATHS', '$rootScope','Location','ViewStack',
            function ($scope, $window, Messaging, Buildfire, COLLECTIONS, EVENTS, $timeout, $sce, DB, PATHS, $rootScope,Location,ViewStack) {

                var WidgetMedia = this;
                WidgetMedia.API = null;
                WidgetMedia.showVideo = false;
                WidgetMedia.showSource = false;
                WidgetMedia.loadingVideo = false;
                WidgetMedia.listeners={};
                var MediaCenter = new DB(COLLECTIONS.MediaCenter);
                WidgetMedia.onPlayerReady = function ($API) {
                    WidgetMedia.API = $API;
                    WidgetMedia.loadingVideo = true;
                };


                var vs = ViewStack.getCurrentView();
                console.log('viewStack.getCurrentView----------------------',vs);

                WidgetMedia.videoPlayerConfig = {
                    autoHide: false,
                    preload: "none",
                    sources: undefined,
                    tracks: undefined,
                    theme: {
                        url: "http://www.videogular.com/styles/themes/default/latest/videogular.css"
                    }
                };
                WidgetMedia.changeVideoSrc = function () {
                    if (WidgetMedia.item.data.videoUrl)
                        WidgetMedia.videoPlayerConfig.sources = [{
                            src: $sce.trustAsResourceUrl(WidgetMedia.item.data.videoUrl),
                            type: 'video/' + WidgetMedia.item.data.videoUrl.split('.').pop() //"video/mp4"
                        }];
                };

                WidgetMedia.openPlayer=function(){
                    ViewStack.push({
                        template: 'now-playing',
                        params: {
                            controller: "NowPlayingCtrl as NowPlaying",
                            shouldUpdateTemplate : true
                        },
                        media: WidgetMedia.item
                    });
                };
                MediaCenter.get().then(function (data) {
                    WidgetMedia.media = {
                        data: data.data
                    };
                    $rootScope.backgroundImage = WidgetMedia.media.data.design.backgroundImage;
                }, function (err) {
                    WidgetMedia.media = {
                        data: {}
                    };
                    console.error('Get Error---', err);
                });


                WidgetMedia.sourceChanged = function ($source) {
                    WidgetMedia.API.stop();
                };

                WidgetMedia.item = {
                    data: {
                        audioUrl: "",
                        body: "",
                        bodyHTML: "",
                        deepLinkUrl: "",
                        image: "",
                        links: [],
                        srcUrl: "",
                        summary: "",
                        title: "",
                        topImage: "",
                        videoUrl: ""
                    }
                };
                if (vs.media) {
                    WidgetMedia.item = vs.media;
                    WidgetMedia.changeVideoSrc();
                    WidgetMedia.iframeSrcUrl = $sce.trustAsUrl(WidgetMedia.item.data.srcUrl);
                }
                else {
                    WidgetMedia.iframeSrcUrl = '';
                }

                /*declare the device width heights*/
                $rootScope.deviceHeight = WidgetMedia.deviceHeight = window.innerHeight;
                $rootScope.deviceWidth = WidgetMedia.deviceWidth = window.innerWidth;

                /*initialize the device width heights*/
                var initDeviceSize = function (callback) {
                    WidgetMedia.deviceHeight = window.innerHeight;
                    WidgetMedia.deviceWidth = window.innerWidth;
                    if (callback) {
                        if (WidgetMedia.deviceWidth == 0 || WidgetMedia.deviceHeight == 0) {
                            setTimeout(function () {
                                initDeviceSize(callback);
                            }, 500);
                        } else {
                            callback();
                            if (!$scope.$$phase && !$scope.$root.$$phase) {
                                $scope.$apply();
                            }
                        }
                    }
                };



                var onUpdateCallback =function (event) {
                    console.log('OnUpdated called in Media controller----------------------------Widget----------',event);
                    switch (event.tag) {
                        case COLLECTIONS.MediaContent:
                            $rootScope.$broadcast("ITEM_LIST_LAYOUT_CHANGED", WidgetMedia.media.data.design.listLayout, true);
                            if (event.data) {
                                WidgetMedia.item = event;
                                $scope.$digest();
                            }
                            break;
                        case COLLECTIONS.MediaCenter:
                            WidgetMedia.media = event;
                            WidgetMedia.media.data.design.itemLayout = event.data.design.itemLayout;
                            $rootScope.$broadcast('ITEM_LAYOUT_CHANGED',WidgetMedia.media.data.design.itemLayout,true);
                            $rootScope.backgroundImage = WidgetMedia.media.data.design.backgroundImage;
                            $scope.$apply();
                            break;
                    }
                };

                /**
                 * Buildfire.datastore.onUpdate method calls when Data is changed.
                 */
                var listener = Buildfire.datastore.onUpdate(onUpdateCallback);

                WidgetMedia.toggleShowVideo = function () {
                    WidgetMedia.showVideo = !WidgetMedia.showVideo;
                    if (WidgetMedia.showVideo)
                        WidgetMedia.API.play();
                    else
                        WidgetMedia.API.pause();
                };

                WidgetMedia.showSourceIframe = function () {
                    var link = WidgetMedia.item.data.srcUrl;
                    if (!/^(?:f|ht)tps?\:\/\//.test(link)) {
                        link = "http://" + link;
                    }
                    Buildfire.navigation.openWindow(link, '_system');
                    /* WidgetMedia.showSource = !WidgetMedia.showSource;
                     if (WidgetMedia.showSource) {
                     $timeout(function () {
                     angular.element('#sourceIframe').attr('src', WidgetMedia.item.data.srcUrl);
                     }, 1000);
                     }*/
                };

                WidgetMedia.executeAction = function (actionItem) {
                    Buildfire.actionItems.execute(actionItem);
                };

                WidgetMedia.videoLoaded = function () {
                    WidgetMedia.loadingVideo = false;
                };


              var initializing = true;
                $scope.$watch(function () {
                    return WidgetMedia.item.data.videoUrl;
                }, function () {
                    if (initializing) {
                        $timeout(function () {
                                initializing = false;
                        });
                    } else {
                        WidgetMedia.changeVideoSrc();
                    }
                });


                //Sync with Control section
                Messaging.sendMessageToControl({
                    name: EVENTS.ROUTE_CHANGE,
                    message: {
                        path: PATHS.MEDIA,
                        id: WidgetMedia.item.id || null
                    }
                });

                /**
                 * Implementation of pull down to refresh
                 */
                var onRefresh=Buildfire.datastore.onRefresh(function(){
                });

                /**
                 * Unbind the onRefresh
                 */
                $scope.$on("$destroy", function () {
                    console.log('$scope.$on called on Media Controller---------------------');
                    onRefresh.clear();
                    Buildfire.datastore.onRefresh(function(){
                        Location.goToHome();
                    });
                    listener.clear();
                    for (var i in WidgetMedia.listeners) {
                        if (WidgetMedia.listeners.hasOwnProperty(i)) {
                            WidgetMedia.listeners[i]();
                        }
                    }
                });

                WidgetMedia.listeners['POP'] = $rootScope.$on('BEFORE_POP', function (e, view) {
                    if(view.template==WidgetMedia.media.data.design.itemLayout){
                        $rootScope.$broadcast('Media_Info_Updated',WidgetMedia.media);
                        Messaging.sendMessageToControl({
                            name: EVENTS.ROUTE_CHANGE,
                            message: {
                                path: PATHS.HOME
                            }
                        });

                    }
                    console.log("BEFORE_POP called--in Media Controller----------:", view, 'Media',WidgetMedia.media.data.design.itemLayout);

                    if (WidgetMedia.media && WidgetMedia.media.data && WidgetMedia.media.data.design && (WidgetMedia.media.data.design.itemLayout==view.template)) {
                        $scope.$destroy();
                    }
                });

                $rootScope.$on('VIEW_CHANGED', function (e, type, view) {
                    console.log('VIEW_CHANGED event called--------in content.home.controller---',type,view);
                    if (type == 'POP') {
                        Buildfire.datastore.onUpdate(onUpdateCallback)
                    }
                });

                $rootScope.$on('deviceLocked', function () {
                    // pause videogular video (if any)
                    if(WidgetMedia.API)
                    WidgetMedia.API.pause();

                    // pause Youtube video (no need to check if there is any yt video playing)
                    callPlayer('ytPlayer', 'pauseVideo');

                    // pause Vimeo video (no need to check if there is any vimeo video playing)
                    callVimeoPlayer('ytPlayer');
                });

                /*$rootScope.$on('Media_Info_Updated',function(e, info){
                    console.log('Media_Info_Updated recieved in media controller----',info);
                    if(info){
                        WidgetMedia.media=info;
                        //$rootScope.$broadcast('ITEM_LAYOUT_CHANGED',WidgetMedia.media.data.design.itemLayout,true);
                    }
                    $scope.$digest();
                });*/

            }]);
})(window.angular, window);