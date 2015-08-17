'use strict';

(function (angular, window) {
    angular
        .module('mediaCenterContent')
        .controller('ContentHomeCtrl', ['$scope', 'MediaContent', '$csv', function ($scope, MediaContent, FormatConverter) {


            function isValidItem(item, index, array) {
                return item.fName || item.lName;
            }

            function validateCsv(items) {
                if (!Array.isArray(items) || !items.length) {
                    return false;
                }
                return items.every(isValidItem);
            }


            var header = {
                topImage: "Image URL",
                fName: "First Name",
                lName: "Last Name",
                position: "Position",
                deepLinkUrl: "Deeplink Url",
                bodyContent: "Information"
            };

            var ContentHome = this;


            /**
             * ContentHome.exportCSV() used to export people list data to CSV
             */
            ContentHome.exportCSV = function () {
                var searchoption = {
                    filter: {"$json.description": {"$regex": '/*'}}, page: 0, pageSize: 50 // the plus one is to check if there are any more
                };
                MediaContent.find(searchoption).then(function (data) {
                    console.log(data);
                    var media = [];
                    angular.forEach(angular.copy(data), function (value) {
                        /*delete value.data.dateCreated;
                         delete value.data.iconImage;
                         delete value.data.socialLinks;
                         delete value.data.rank;*/
                        media.push(value.id);
                    });

                    FormatConverter.downloadCSVfromNonJSONData(media, 'lakshay', "Export.csv");

                }, function () {
                    console.log('error in exporting csv');
                });
            };


            /**
             * ContentHome.getTemplate() used to download csv template
             */
            ContentHome.getTemplate = function () {
                var templateData = [{
                    topImage: "",
                    fName: "",
                    lName: "",
                    position: "",
                    deepLinkUrl: "",
                    bodyContent: ""
                }];
                var csv = FormatConverter.jsonToCsv(angular.toJson(templateData), {
                    header: header
                });
                FormatConverter.download(csv, "Template.csv");
            };


            /* importCsv error and success callbacks*/
            ContentHome.importCsvCallbacks = {
                success: function (rows) {
                    ContentHome.loading = true;
                    if (rows && rows.length) {
                        var rank = ContentHome.data.content.rankOfLastItem || 0;
                        for (var index = 0; index < rows.length; index++) {
                            rank += 10;
                            rows[index].dateCreated = +new Date();
                            rows[index].socialLinks = [];
                            rows[index].rank = rank;
                        }
                        if (validateCsv(rows)) {
                            /* Buildfire.datastore.bulkInsert(rows, TAG_NAMES.PEOPLE, function (err, data) {
                             ContentHome.loading = false;
                             $scope.$apply();
                             if (err) {
                             console.error('There was a problem while importing the file----', err);
                             }
                             else {
                             console.log('File has been imported----------------------------', data);
                             ContentHome.busy = false;
                             ContentHome.loadMore();
                             ContentHome.data.content.rankOfLastItem = rank;
                             }
                             });*/

                            MediaContent.insert(rows).then(function () {
                                alert('success');
                            }, function () {
                                alert('error');
                            });

                        } else {
                            ContentHome.loading = false;
                            $scope.$apply();
                            ContentHome.csvDataInvalid = true;
                            $timeout(function hideCsvDataError() {
                                ContentHome.csvDataInvalid = false;
                            }, 2000)
                        }
                    }
                    else {
                        ContentHome.loading = false;
                        $scope.$apply();
                    }
                }, error: function (error) {
                    ContentHome.loading = false;
                    $scope.apply();
                    //do something on cancel
                }
            };


        }])
})(window.angular, window);
