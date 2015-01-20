/**
 * Created by Michael on 14/11/14.
 */
(function () {

    function ctrlReportItems($scope, enumApi, newsApi) {

        enumApi.getEnumsByType('school_type')
            .success(function (data) {
                $scope.schoolTypeList = data.val || {}
            })

        enumApi.getEnumsByType('school_grade')
            .success(function (data) {
                $scope.gradeTypeList = data.val || {}
            })

        enumApi.getEnumsByType('facilities')
            .success(function (data) {
                $scope.facilitiesList = data.val || {}
            })

        $scope.addSchool = function () {
            if (!$scope.item.schools) {
                $scope.item.schools = []
            }
            var temp = {name: {}}
            $scope.item.schools.push(temp)
        }

        $scope.onRemoveSchool = function (index) {
            $scope.item.schools.splice(index, 1)
        }

        $scope.addRailway = function () {
            if (!$scope.item.railway_lines) {
                $scope.item.railway_lines = []
            }
            var temp = {distance: {}}
            $scope.item.railway_lines.push(temp)
        }

        $scope.onRemoveRailway = function (index) {
            $scope.item.historical_price.splice(index, 1)
        }

        $scope.addBusStation = function () {
            if (!$scope.item.bus_lines) {
                $scope.item.bus_lines = []
            }
            var temp = {distance: {}}
            $scope.item.bus_lines.push(temp)
        }

        $scope.onRemoveBusStation = function (index) {
            $scope.item.bus_lines.splice(index, 1)
        }

        $scope.addCarRental = function () {
            if (!$scope.item.car_rental_location) {
                $scope.item.car_rental_location = []
            }
            var temp = {
                distance: {}
            }
            $scope.item.car_rental_location.push(temp)
        }

        $scope.onRemoveCarRental = function (index) {
            $scope.item.car_rental_location.splice(index, 1)
        }

        $scope.addBicycleRental = function () {
            if (!$scope.item.bicycle_rental_location) {
                $scope.item.bicycle_rental_location = []
            }
            var temp = {
                distance: {}
            }
            $scope.item.bicycle_rental_location.push(temp)
        }

        $scope.onRemoveBicycleRental = function (index) {
            $scope.item.bicycle_rental_location.splice(index, 1)
        }

        $scope.addFacilities = function () {
            if (!$scope.item.facilities) {
                $scope.item.facilities = []
            }
            var temp = {
                name: {},
                address: {},
                distance: {}
            }
            $scope.item.facilities.push(temp)
        }

        $scope.onRemoveFacilities = function (index) {
            $scope.item.facilities.splice(index, 1)
        }

        $scope.addPlanningNews = function () {
            if (!$scope.item.planning_news) {
                $scope.item.planning_news = []
            }
            var temp = {
                title: {},
                summary: {}
            }
            $scope.item.planning_news.splice(0, 0, temp);
        }

        $scope.onRemovePlanningNews = function (index) {
            $scope.item.planning_news.splice(index, 1)
        }

        $scope.addSupplementNews = function () {
            if (!$scope.item.supplement_news) {
                $scope.item.supplement_news = []
            }
            var temp = {
                title: {},
                summary: {}
            }
            $scope.item.supplement_news.splice(0, 0, temp);
        }

        $scope.onRemoveSupplementNews = function (index) {
            $scope.item.supplement_news.splice(index, 1)
        }

        $scope.addJobNews = function () {
            if (!$scope.item.job_news) {
                $scope.item.job_news = []
            }
            var temp = {
                title: {},
                summary: {}
            }
            $scope.item.job_news.splice(0, 0, temp);
        }

        $scope.onRemoveJobNews = function (index) {
            $scope.item.job_news.splice(index, 1)
        }

        enumApi.getEnumsByType('news_category').success(function (data) {
            var res = data.val
            $scope.newsCategoryList = []
            for (var index in res) {
                if (res[index].slug === 'announcement' || res[index].slug === 'purchase_process' ||
                    res[index].slug === 'legal_resource' || res[index].slug === 'real_estate') {
                    $scope.newsCategoryList.push(res[index])
                }
            }
        })

        $scope.selected = {}
        $scope.selected.category = {}

        $scope.$watch('selected.category', function (newValue, oldValue) {
            if (newValue === oldValue) {
                return
            }
            if (newValue) {
                params.category = newValue.id
            } else {
                delete params.category
            }
            newsApi.getAll({params: params, errorMessage: true}).success(onGetList)
        }, true)

        var params = {
            per_page: $scope.perPage
        }

        newsApi.getAll({
            params: params
        }).success(onGetList)

        $scope.nextPage = function () {
            var lastItem = $scope.newsList[$scope.newsList.length - 1]
            if (lastItem.time) {
                params.time = lastItem.time
            }
            newsApi.getAll({params: params})
                .success(function () {
                    $scope.currentPageNumber += 1
                })
                .success(onGetList)

        }
        $scope.prevPage = function () {

            var prevPrevPageNumber = $scope.currentPageNumber - 2
            var prevPrevPageData
            var lastItem
            if (prevPrevPageNumber >= 1) {
                prevPrevPageData = $scope.pages[prevPrevPageNumber]
                lastItem = prevPrevPageData[prevPrevPageData.length - 1]
            }

            if (lastItem) {
                if (lastItem.time) {
                    params.time = lastItem.time
                }
            } else {
                delete params.time
            }

            newsApi.getAll({params: params})
                .success(function () {
                    $scope.currentPageNumber -= 1
                })
                .success(onGetList)
        }

        $scope.onPlanning = function ($event, data) {
            if (!$scope.item.planning_news) {
                $scope.item.planning_news = []
            }
            var field = $scope.newsList[data - 1]
            var temp = {
                title: field.title,
                summary: field.summary,
                link: '/news/' + field.id
            }
            $scope.item.planning_news.splice(0, 0, temp);
        }

        $scope.onSupplement = function ($event, data) {
            if (!$scope.item.supplement_news) {
                $scope.item.supplement_news = []
            }
            var field = $scope.newsList[data - 1]
            var temp = {
                title: field.title,
                summary: field.summary,
                link: '/news/' + field.id
            }
            $scope.item.supplement_news.splice(0, 0, temp);
        }

        $scope.onJob = function ($event, data) {
            if (!$scope.item.job_news) {
                $scope.item.job_news = []
            }
            var field = $scope.newsList[data - 1]
            var temp = {
                title: field.title,
                summary: field.summary,
                link: '/news/' + field.id
            }
            $scope.item.job_news.splice(0, 0, temp);
        }

        function onGetList(data) {
            $scope.fetched = true
            $scope.newsList = data.val
            $scope.pages[$scope.currentPageNumber] = $scope.newsList

            if (!$scope.newsList || $scope.newsList.length < $scope.perPage) {
                $scope.noNext = true
            } else {
                $scope.noNext = false
            }
            if ($scope.currentPageNumber <= 1) {
                $scope.noPrev = true
            } else {
                $scope.noPrev = false
            }
        }
    }

    angular.module('app').controller('ctrlReportItems', ctrlReportItems)

})()