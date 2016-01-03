var app = angular.module('myApp', ['ngRoute', 'ui.bootstrap', 'ui.directives', 'ui.filters']);
app.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/login', {
                templateUrl: 'Login.html',
                controller: 'LoginCtrl'
            }).
            when('/home', {
                templateUrl: 'bootstraphome.html',
                controller: 'LoginCtrl'
            }).

            when('/register', {
                templateUrl: 'Register.html',
                controller: 'RegisterCtrl'
            }).
            when('/getride', {
                templateUrl: 'GetRide.html',
                controller: 'RidesCtrl'
            }).
            when('/rideshistory', {
                templateUrl: 'MyAcceptedRides.html',
                controller: 'RidesCtrl'
            }).
            when('/offerride', {
                templateUrl: 'OfferARide.html',
                controller: 'RidesCtrl'
            }).
            when('/offershistory', {
                templateUrl: 'MyOffers.html',
                controller: 'RidesCtrl'
            }).
            when('/subscribe', {
                templateUrl: 'Subscribe.html',
                controller: 'RidesCtrl'
            }).
            when('/settings', {
                templateUrl: 'Settings.html',
                controller: 'RidesCtrl'
            }).when('/subscribe', {
                templateUrl: 'Subscribe.html',
                controller: 'RidesCtrl'
            }).
            when('/sendnotification', {
                templateUrl: 'SendPush.html',
                controller: 'RidesCtrl'
            }).
            otherwise({
                redirectTo: '/login'
            });
    }
]);
app.service('UserService', function () {
    var loggedinUser = '';

    var setLoggedIn = function (newObj) {
        loggedinUser = newObj;
        console.log("New User = " + JSON.stringify(loggedinUser));
    };

    var getLoggedIn = function () {
        return loggedinUser;
    };

    return {
        setLoggedIn: setLoggedIn,
        getLoggedIn: getLoggedIn
    };
});
app.controller('LogoutCtrl', function ($scope, UserService) {
    UserService.setLoggedIn('');
});
//app.controller('NavBarCtrl', function () { });
app.controller('OfferRideCtrl', function ($scope, $http, $filter, UserService) {
    $scope.spinner = false;
    $scope.login_email = UserService.getLoggedIn().email;

});

app.controller('RidesCtrl', function ($scope, $http, $filter, UserService) {
    $scope.spinner = false;
    $scope.allrides = false;
    $scope.cityRides = '';
    $scope.cancel = false;
    $scope.uuid = UserService.getLoggedIn().uuid;

    $scope.settings = adjustsettings(UserService.getLoggedIn().settings);
    $scope.selectedto = undefined;
    $scope.selectedfrom = undefined;
    console.log("RidesCtrl User = " + JSON.stringify(UserService.getLoggedIn()));
    $scope.login_email = UserService.getLoggedIn().email;
    $scope.found = '';
    $scope.result = '';
    $scope.groupusers = [];
    $scope.fullname = UserService.getLoggedIn().fullname;
    var param_name = '';
    $scope.offererUUID = '';

    var today = new Date().toISOString().slice(0, 10);
    $scope.today = {
        value: today
    };
    $scope.maxDate = {
        value: new Date(2015, 12, 31, 14, 57)
    };
    $scope.SendOffer = function (offer) {
        $scope.loginResult = '';
        var offerDate = new Date(offer.time);
        alert("OfferDate=" + offerDate);
        var now = new Date();
        if (offerDate < now) {
            $scope.loginResult = "Ride date " + offerDate + " is in past. Please correct offer date.";
            $scope.spinner = false;
            return;
        }
        $scope.spinner = true;
        var filteredtime = $filter('date')(offerDate, 'medium');
        
        //   var filterdatetime = $filter('datetmUTC')( offerDate );
    
    
        var sendURL = "http://sujoyghosal-test.apigee.net/rideshare/createrideshare?email="
            + $scope.login_email + "&offeredby=" + offer.name + "&phone_number=" + offer.phone + "&time=" + filteredtime + "&city=" + offer.city + "&status=ACTIVE"
            + "&from_place=" + offer.from + "&to_place=" + offer.to + "&via=" + offer.via + "&maxcount=" + offer.maxcount + "&vehicle_type=" + offer.vehicletype;
        $scope.loginResult = "Sent Request";

        $http({
            method: 'GET',
            url: sendURL
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available      
            $scope.loginResult = "Success";
            $scope.spinner = false;
            $scope.status = response.statusText;
            notifyUsersInGroup("TO-" + offer.city.trim().toUpperCase() + "-" +
                offer.to.trim().toUpperCase(), offer.from, offer.to, filteredtime, offer.name, offer.phone);
            //      alert("Offer " + response.statusText);
            var MS_PER_MINUTE = 60000;
            var myStartDate = new Date(offerDate.valueOf() - 15 * MS_PER_MINUTE);
            //send notification to creator 15 min b4 ride starts
            schedulePush(myStartDate);

        }, function errorCallback(error) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.loginResult = "Error Received from Server.." + error.toString();
            $scope.spinner = false;
            $scope.status = error.statusText;
        });
    };

    function schedulePush(time) {
        window.plugin.notification.local.add({
            date: time,
            message: 'Your ride offer is 15min from now. Please start.'
        });
    }

    $scope.SendPush = function (gcmids, text) {
        if (!gcmids || !text)
            return;
        if (text.length === 0) {
            console.log("No text for push message. ");
            return;
        }
        $scope.spinner = true;

        var notifyURL = encodeURI("http://sujoyghosal-test.apigee.net/sendpush/devicespush?regids=" + gcmids + "&text=" + text);
        console.log("SendPush: notifyURL=" + notifyURL);
        $http({
            method: 'GET',
            url: notifyURL
        }).then(function successCallback(response) {
            $scope.spinner = false;
 
            //   $scope.result = "Successfully Sent Push Messages to Subscribed Users for these locations.";
        }, function errorCallback(error) {
            $scope.spinner = false;
            //          $scope.result = "Could not send push messages. ";
        });
    };
    var notifyUsersInGroup = function (group, from, to, time, by, phone) {
        $scope.spinner = true;   
        //first create group with id=<city>-<place>
        var getURL = "http://sujoyghosal-test.apigee.net/rideshare/getusersingroup?group=" + group;
        getURL = encodeURI(getURL);
        $http({
            method: 'GET',
            url: getURL
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.spinner = false;
            var users = [];
            var gcmids = '';
            users = response.data;
            for (var i = 0; i < users.length; i++) {
                if (!checkIfPushAllowedNow(users[i].settings))
                    continue;
                var gcms = [];
                gcms = users[i].gcm_ids;
                for (var j = 0; j < gcms.length; j++) {
                    //   gcmids.push(gcms[j]);
                    gcmids += gcms[j] + "^";
                }
            }

            $scope.SendPush(gcmids, "A new rideshare created by " + by + "(ph: " + phone + "), starting at " + time + " from " + from + " to " + to);
               
            // $scope.found  = "Active ride offers for " + param_name;
        }, function errorCallback(error) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.spinner = false;
            $scope.groupusers = "ERROR GETTING GROUP USERS ";
            $scope.allrides = false;
        });
    };
    function checkIfPushAllowedNow(settingsObject) {
        console.log("checkIfPushAllowedNow: received input - " + JSON.stringify(settingsObject));
        if (!settingsObject)
            return true;
        
        if (settingsObject.pushon) {
            var start = new Date(settingsObject.pushstarttime);
            var stop = new Date(settingsObject.pushstoptime);
            var timenow = new Date();
            start.setFullYear(timenow.getFullYear(), timenow.getMonth(), timenow.getDate());
            stop.setFullYear(timenow.getFullYear(), timenow.getMonth(), timenow.getDate());
            if (stop < start)
                stop.setDate(timenow.getDate() + 1);
            if(stop === start)
                return true;
            if (timenow < start || timenow > stop) {
                return false;
            }
            else {
                return true;
            }
        } else
            return false;
    }

    $scope.GetRides = function (paramname, paramvalue) {
        $scope.spinner = true;
        if (!paramname || !paramvalue)
            return;
        param_name = paramname.trim();
        var getURL = "http://sujoyghosal-test.apigee.net/rideshare/getrides?paramname="
            + param_name + "&paramvalue=" + paramvalue.trim();
        getURL = encodeURI(getURL);
        $http({
            method: 'GET',
            url: getURL
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.spinner = false;
            $scope.cityRides = response.data;
            if (angular.isObject($scope.cityRides))
                $scope.found = $scope.cityRides.length + " rides found";

            $scope.allrides = true;
            $scope.cancel = false;
        }, function errorCallback(error) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.spinner = false;
            //      $scope.result = "Could not submit acceptance. " + error;
            $scope.allrides = false;
        });

    };

    function adjustsettings(settingsObject) {
        if (!settingsObject)
            return true;       
        
        var start = new Date(settingsObject.pushstarttime);
        var stop = new Date(settingsObject.pushstoptime);
        var timenow = new Date();
        start.setFullYear(timenow.getFullYear(), timenow.getMonth(), timenow.getDate());
        stop.setFullYear(timenow.getFullYear(), timenow.getMonth(), timenow.getDate());
        if (stop < start)
            stop.setDate(timenow.getDate() + 1);
        settingsObject.pushstarttime = start;
        settingsObject.pushstoptime = stop;
        return  settingsObject;         
    }
    $scope.HaveIAcceptedThisRide = function (row, login_email) {
        var passengers = [];
        passengers = row.passengers;
        if (!passengers || passengers.length < 1)
            return false;
        for (var i = 0; i < passengers.length; i++) {
            if (login_email === passengers[i].passenger_email) {
                return true;
            }
        }
        return false;
    }

    $scope.Subscribe = function (data, type, user) {

        $scope.spinner = true;
        $scope.result = "Sending Request....";
        //first create group with id=<city>-<place>
        var getURL = "http://sujoyghosal-test.apigee.net/rideshare/creategroup?group=";
        var group = '';
        if (type === "to") {
            group = "TO-" + data.citySelect.toString().trim().toUpperCase() + "-" + data.to.toString().trim().toUpperCase();
        } else if (type === "from") {
            group = "FROM-" + data.citySelect.toString().trim().toUpperCase() + "-" + data.from.toString().trim().toUpperCase();
        } else return;

        getURL = encodeURI(getURL + group);
        $scope.result = getURL;
        $http({
            method: 'GET',
            url: getURL
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.spinner = false;
            //     $scope.result = "SUCCESS ADDING GROUP " + group;
            var u = $scope.login_email;
            addUserToGroup(group, u);
            //$scope.found  = "Active ride offers for " + param_name;
        }, function errorCallback(error) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.spinner = false;
            $scope.found = "Could not submit acceptance. " + error;
            $scope.allrides = false;
        });

    };

    var addUserToGroup = function (group, user) {
        $scope.spinner = true;   
        //first create group with id=<city>-<place>
        var getURL = "http://sujoyghosal-test.apigee.net/rideshare/addusertogroup?group=" + group + "&user=" + user;
        getURL = encodeURI(getURL);
        $http({
            method: 'GET',
            url: getURL
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.spinner = false;
            $scope.result = "SUCCESS ADDING SUBSCRIPTION TO PUSH MESSAGES FOR EVENT " + group;     
            // $scope.found  = "Active ride offers for " + param_name;
        }, function errorCallback(error) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.spinner = false;
            $scope.result = "ERROR ADDING SUBSCRIPTION TO PUSH MESSAGES ";
            $scope.allrides = false;
        });
    };

    var getUsersInGroup = function (group) {
        $scope.spinner = true;   
        //first create group with id=<city>-<place>
        var getURL = "http://sujoyghosal-test.apigee.net/rideshare/getusersingroup?group=" + group;
        getURL = encodeURI(getURL);
        $http({
            method: 'GET',
            url: getURL
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.spinner = false;
            $scope.groupusers = response;     
            // $scope.found  = "Active ride offers for " + param_name;
        }, function errorCallback(error) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.spinner = false;
            $scope.groupusers = "ERROR GETTING GROUP USERS ";
            $scope.allrides = false;
        });
    };

    function SendPushToUserByEmail(email, text) {

        $scope.spinner = true;
        var getURL = "http://sujoyghosal-test.apigee.net/rideshare/getuser?email=" + email.trim();
        getURL = encodeURI(getURL);
        $http({
            method: 'GET',
            url: getURL
        }).then(function successCallback(response) {
            $scope.spinner = false;
            if (angular.isObject(response) && response.data.toString() === "User Not Found") {
                $scope.found = "Id Not Found";
            } else {
                var obj = response.data[0];
                if (!checkIfPushAllowedNow(obj.settings)) {
                    console.log("SendPushToUser: Prevented push as filtered by settings opitions. " + ":"
                        + JSON.stringify(response.data.settings));
                    return;
                } else {
                    console.log("SendPushToUser: Sending Push as filtered by settings opitions. " + ":"
                        + JSON.stringify(response.data.settings));
                    SendPushToUser(obj.uuid, text);
                }

                return;
            }
        }, function errorCallback(error) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            //      $scope.loginResult = "Could not submit login request.." + error;
            $scope.spinner = false;
            //      $scope.login_email = '';
        });
    }
    $scope.NotifyPassengersInRide = function (rideid, text) {
        if (!rideid) {
            alert("ERROR - RIDE ID NOT FOUND");
            $scope.found = "ERROR - RIDE ID NOT FOUND";
            return;
        }
        $scope.spinner = true;
        //first create group with id=<city>-<place>
        var getURL = "http://sujoyghosal-test.apigee.net/rideshare/getpassengersforride?uuid=" + rideid.trim();
        getURL = encodeURI(getURL);
        $http({
            method: 'GET',
            url: getURL
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.spinner = false;
            var passengers = [];
            passengers = response.data;

            for (var i = 0; i < passengers.length; i++) {
                var auuid = '';
                auuid = passengers[i].passenger_uuid;
                SendPushToUser(auuid, text);
            }
        }, function errorCallback(error) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.spinner = false;
            $scope.passengers = "ERROR GETTING PASSENGERS ";
        });
    };

    function SendPushToUser(uuid, text) {
        $scope.spinner = true;
        if (!uuid) {
            $scope.found = "ERROR";
            return;
        }
        //first create group with id=<city>-<place>
        var getURL = "http://sujoyghosal-test.apigee.net/rideshare/getuserbyuuid?uuid=" + uuid.trim();
        getURL = encodeURI(getURL);
        $http({
            method: 'GET',
            url: getURL
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available           
            $scope.spinner = false;

            if (!checkIfPushAllowedNow(response.data.settings)) {
                console.log("SendPushToUser: Prevented push as filtered by settings opitions. " + uuid + ":"
                    + JSON.stringify(response.data.settings));
                return;
            } else {
                console.log("SendPushToUser: Sending Push as filtered by settings opitions. " + uuid + ":"
                    + JSON.stringify(response.data.settings));
            }


            var gcmidarray = [];
            gcmidarray = response.data.gcm_ids;
            console.log("SendPush GCMIDs=" + JSON.stringify(gcmidarray));
            var gcmids = '';
            if (gcmidarray && gcmidarray.length > 0) {
                for (var i = 0; i < gcmidarray.length; i++) {
                    gcmids += gcmidarray[i] + "^";
                }
                $scope.SendPush(gcmids, text);
            }

        }, function errorCallback(error) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.spinner = false;
        });
    };
    $scope.SendSettings = function (settings) {
        $scope.result = '';
        $scope.spinner = true;
        var starttime = new Date(settings.fromtime);
        var stoptime = new Date(settings.totime);
        starttime.setFullYear(1970, 1, 1);
        stoptime.setFullYear(2070, 1, 1);
        $scope.spinner = true;
        var getURL = "http://sujoyghosal-test.apigee.net/rideshare/updateusersettings?uuid=" + $scope.uuid + "&starttime=" + starttime
            + "&stoptime=" + stoptime + "&pushon=" + settings.pushon;
        getURL = encodeURI(getURL);
        $http({
            method: 'GET',
            url: getURL
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.spinner = false;
            $scope.result = "SUCCESS SAVING YOUR SETTINGS ";     
            // $scope.found  = "Active ride offers for " + param_name;
        }, function errorCallback(error) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.spinner = false;
            $scope.result = "ERROR ADDING SUBSCRIPTION TO PUSH MESSAGES ";
            $scope.allrides = false;
        });
    };

    $scope.AcceptRide = function (row) {
        $scope.uuid = '';
        $scope.result = '';
        $scope.spinner = true;
        var loggedinUser = UserService.getLoggedIn();
        var updateURL = "http://sujoyghosal-test.apigee.net/rideshare/acceptride?uuid=" + row.uuid
            + "&passenger_name=" + loggedinUser.fullname
            + "&passenger_phone=" + loggedinUser.phone
            + "&passenger_email=" + loggedinUser.email
            + "&passenger_gcmids=" + loggedinUser.uuid
            + "&passenger_uuid=" + loggedinUser.uuid;
        console.log("Accept Ride URL is: " + updateURL);
        $http({
            method: 'GET',
            url: updateURL
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            //alert(response)
            //   $scope.found  = "Accepted Ride Successfully going from " + row.from + " to " + row.to + " at " + row.time;
            $scope.spinner = false;
            if (response.data === "Already Accepted") {
                $scope.result = response.data;
                $scope.uuid = row.uuid;
                $scope.allrides = true;
                $scope.cancel = true;
                return;
            } else {
                $scope.result = "Successfully Accepted";
                $scope.GetRides("city", row.city);
                $scope.uuid = row.uuid;
                $scope.allrides = true;
                $scope.cancel = true;
                SendPushToUserByEmail(row.email, "Ride accepted by a passenger");
            }


        }, function errorCallback(error) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.spinner = false;
            $scope.acceptedRide = "Could not submit acceptance. " + error;
            $scope.cancel = false;
        });

    };
    var accepts = [];

    $scope.GetRideAcceptances = function (row, cancel) {
        $scope.spinner = true;
        var acceptsURL = "http://sujoyghosal-test.apigee.net/rideshare/getrideacceptances?uuid=" + row.uuid;
        $http({
            method: 'GET',
            url: acceptsURL
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.spinner = false;
            accepts = response.data.entities;
            if (cancel)
                $scope.CancelRide(row, false);
        }, function errorCallback(error) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.spinner = false;
            alert("Could not submit acceptance. " + error);
            $scope.accepted = false;
        });

    };

    $scope.GetMyAcceptedRides = function (email) {
        $scope.spinner = true;
        var getURL = "http://sujoyghosal-test.apigee.net/rideshare/acceptedrides?email=" + email.trim();
        getURL = encodeURI(getURL);
        $http({
            method: 'GET',
            url: getURL
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.spinner = false;
            if (angular.isArray(response.data)) {
                $scope.cityRides = response.data;
                // $scope.found  = "Active ride offers for " + param_name;
                $scope.allrides = true;
                $scope.cancel = true;
            } else {
                $scope.result = response.data;
                // $scope.found  = "Active ride offers for " + param_name;
                $scope.allrides = false;
                $scope.cancel = false;
            }

        }, function errorCallback(error) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.spinner = false;
            $scope.found = "Oops! There was a problem. " + error;
            $scope.allrides = false;
        });

    };
    $scope.CancelOffer = function (row) { 
        //   $scope.uuid = ''; 
        //    $scope.GetRideAcceptances(row);    
        $scope.spinner = true;
        $scope.NotifyPassengersInRide(row.uuid, "A ride offered by " + $scope.fullname + " has been cancelled");
        //        $scope.NotifyPassengersInRide(row.uuid, "I have cancelled the ride from " +
        //            row.from_place + " to " + row.to_place + " with start time " + $filter('date')(offerDate, 'medium') + ". - " + row.offeredby);

        var cancelURL = "http://sujoyghosal-test.apigee.net/rideshare/canceloffer?uuid=" + row.uuid;
        $http({
            method: 'GET',
            url: cancelURL
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.spinner = false;
            alert("Successfully Cancelled.")
            $scope.cancel = true;
            $scope.GetRides('email', $scope.login_email);
            $scope.result = "Successfully Cancelled This Offer";
            //            GetRides('email',$scope.login_email);          
        }, function errorCallback(error) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.spinner = false;
            $scope.result = "Could not cancel. " + cancelURL;
            $scope.accepted = false;
            $scope.uuid = row.uuid;
            $scope.cancel = false;
            return;
        });
    };

    $scope.CancelRide = function (row, responseAsMessage) { 
        //   $scope.uuid = ''; 
        //    $scope.GetRideAcceptances(row);    
        $scope.spinner = true;
        var cancelURL = "http://sujoyghosal-test.apigee.net/rideshare/cancelacceptedride?uuid=" + row.uuid + "&passenger_email=" + UserService.getLoggedIn().email;
        $http({
            method: 'GET',
            url: cancelURL
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.spinner = false;
            alert("Successfully Cancelled.")
            if (responseAsMessage) {
                $scope.GetMyAcceptedRides(login_email);
                return;
            }
            $scope.uuid = row.uuid;
            $scope.cancel = true;
            $scope.GetRides("city", row.city);
            $scope.result = "Cancelled ride";
            SendPushToUserByEmail(row.email, "Ride cancelled by a passenger");
        }, function errorCallback(error) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.spinner = false;
            $scope.result = "Could not cancel. ";
            $scope.accepted = false;
            $scope.uuid = row.uuid;
            $scope.cancel = false;
        });
    };


})



app.controller('FundooCtrl', function ($scope, $window) {
    $scope.rating = 5;
    $scope.saveRatingToServer = function (rating) {
        $window.alert('Rating selected - ' + rating);
    };
})
    .directive('fundooRating', function () {
        return {
            restrict: 'A',
            template: '<ul class="rating">' +
            '<li ng-repeat="star in stars" ng-class="star" ng-click="toggle($index)">' +
            '\u2605' +
            '</li>' +
            '</ul>',
            scope: {
                ratingValue: '=',
                max: '=',
                readonly: '@',
                onRatingSelected: '&'
            },
            link: function (scope, elem, attrs) {

                var updateStars = function () {
                    scope.stars = [];
                    for (var i = 0; i < scope.max; i++) {
                        scope.stars.push({ filled: i < scope.ratingValue });
                    }
                };

                scope.toggle = function (index) {
                    if (scope.readonly && scope.readonly === 'true') {
                        return;
                    }
                    scope.ratingValue = index + 1;
                    scope.onRatingSelected({ rating: index + 1 });
                };

                scope.$watch('ratingValue', function (oldVal, newVal) {
                    if (newVal) {
                        updateStars();
                    }
                });
            }
        }
    });

app.controller('LoginCtrl', function ($scope, $http, $location, $routeParams, UserService) {
    $scope.spinner = false;

    $scope.isCollapsed = true;
    $scope.isVisible = function () {
        return '/login' !== $location.path();
    };

    $scope.showNav = '/login' !== $location.path();

    $scope.login_email = UserService.getLoggedIn().email;

    if (!angular.isObject($scope.login_email) || $scope.login_email.length == 0)
        $scope.showNav = false;
    else
        $scope.showNav = true;
    // alert($scope.showNav + "," + $scope.login_email.length);
    $scope.Login = function (login) {
        $scope.spinner = true;
        var getURL = "http://sujoyghosal-test.apigee.net/rideshare/getuser?email="
            + login.email.trim();

        getURL = encodeURI(getURL);
        $http({
            method: 'GET',
            url: getURL
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            //      $scope.loginResult = response.data;
            $scope.spinner = false;

            if (angular.isObject(response) && response.data.toString() === "User Not Found") {
                $scope.loginResult = "Id Not Found";

                if (window.confirm("Email ID not found in App database. Would you like to create an account with this id?") == true) {
                    $location.path("/register");
                    return;
                }
            } else {
                //        alert("Id Found");
                var obj = response.data[0];
                UserService.setLoggedIn(obj);
                $scope.loginResult = obj.username;
                $scope.fullname = obj.fullname;
                $scope.showNav = true;
                $scope.login_email = obj.email;
                $location.path("/home");
                //                $scope.fullname = UserService.getLoggedIn().fullname;
                return;
            }
        }, function errorCallback(error) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            //      $scope.loginResult = "Could not submit login request.." + error;
            $scope.spinner = false;

            $scope.loginResult = "Could not submit request..";
            //      $scope.login_email = '';
        });
    };

    $scope.Logout = function () {
        $scope.login_email = '';
        UserService.setLoggedIn('');

        return;
    }
});
app.controller('RegisterCtrl', function ($scope, $http, $location, UserService) {
    $scope.spinner = false;

    $scope.CreateUser = function (user) {
        $scope.spinner = true;
        var getURL = "http://sujoyghosal-test.apigee.net/rideshare/createuser?email="
            + user.email.trim() + "&phone=" + user.phone.trim() + "&dept=" + user.dept.trim() + "&fullname=" + user.fullname.trim() + "&password=" + user.password;
        getURL = encodeURI(getURL);

        $http({
            method: 'GET',
            url: getURL
        }).then(function successCallback(response) {
            // this callback will be called asynchronously
            // when the response is available
            $scope.spinner = false;
            if (angular.isObject(response) && response.data.toString() === "CREATED") {
                alert("Account Created with id " + user.email);

                $location.path("/login");
                return;
            } else {
                $scope.result = response;
                alert("Could not create user id");
        
                //        $location.path("/login");
                return;
            }
        }, function errorCallback(error) {
            // called asynchronously if an error occurs
            // or server returns response with an error status.
            $scope.spinner = false;
            $scope.loginResult = "Could not submit request.." + error;
        });
    }
});
  