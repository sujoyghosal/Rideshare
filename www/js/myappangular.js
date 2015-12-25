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
        controller: 'OfferRideCtrl'
      }).
      when('/offershistory', {
        templateUrl: 'MyOffers.html',
        controller: 'RidesCtrl'
      }).
      when('/subscribe', {
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



app.controller('NavBarCtrl', function ($scope, $location, UserService) {
//  $scope.login_email = UserService.getLoggedIn().email;
  $scope.isCollapsed = true; 
  $scope.isVisible = function () {
    return '/login' !== $location.path();
  };
  
  $scope.showNav = '/login' !== $location.path();


});
app.controller('LogoutCtrl', function ($scope, UserService) {
  UserService.setLoggedIn('');
});
//app.controller('NavBarCtrl', function () { });
app.controller('OfferRideCtrl', function ($scope, $http, $filter, UserService) {
  $scope.spinner = false;
  $scope.login_email = UserService.getLoggedIn().email;
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
    $scope.loginResult = $filter('date')(offerDate, 'medium');
    //   var filterdatetime = $filter('datetmUTC')( offerDate );
    
    
    var sendURL = "http://sujoyghosal-test.apigee.net/rideshare/createrideshare?email="
      + $scope.login_email + "&offeredby=" + offer.name + "&phone_number=" + offer.phone + "&time=" + $scope.loginResult + "&city=" + offer.city + "&status=ACTIVE"
      + "&from_place=" + offer.from + "&to_place=" + offer.to + "&via=" + offer.via + "&maxcount=" + offer.maxcount;
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
      //      alert("Offer " + response.statusText);

    }, function errorCallback(error) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      $scope.loginResult = "Error Received from Server.." + error.toString();
      $scope.spinner = false;
      $scope.status = error.statusText;
    });
  };
});

app.controller('RidesCtrl', function ($scope, $http, $filter, UserService) {
  $scope.spinner = false;
  $scope.allrides = false;
  $scope.cityRides = '';
  $scope.cancel = false;
  $scope.uuid = UserService.getLoggedIn().uuid;
  $scope.selectedto = undefined;
  $scope.selectedfrom = undefined;
  console.log("RidesCtrl User = " + JSON.stringify(UserService.getLoggedIn()));
  $scope.login_email = UserService.getLoggedIn().email;
  $scope.found = '';
  $scope.result = '';
  $scope.fullname = UserService.getLoggedIn().fullname;
  var param_name = '';
  
  
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
      if(angular.isObject($scope.cityRides))
          $scope.found = $scope.cityRides.length +  " rides found";

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

  $scope.Subscribe = function (data, type, user) {

    $scope.spinner = true;
    $scope.result = "Sending Request....";
    //first create group with id=<city>-<place>
    var getURL = "http://sujoyghosal-test.apigee.net/rideshare/creategroup?group=";
    var group = '';
    if (type === "to") {
      group = "TO-" + data.citySelect.toString().trim().toUpperCase() + "-" + data.selectedto.toString().trim().toUpperCase();
    } else if (type === "from") {
      group = "FROM-" + data.citySelect.toString().trim().toUpperCase() + "-" + data.selectedfrom.toString().trim().toUpperCase();
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
      $scope.result = "SUCCESS ADDING SUBSCRIPTION TO PUSH MESSAGES ";     
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
        $scope.result = "Successfully Accepted ride from " + row.from_place + " to "
        + row.to_place + " in " + row.city + " on " + row.time + " offered by " + row.offeredby + " (phone: " + row.phone_number + ").";
        $scope.GetRides("city", row.city);
        $scope.uuid = row.uuid;
        $scope.allrides = true;
        $scope.cancel = true;
 //       $scope.Push();
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
      login_email = email;
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
    var cancelURL = "http://sujoyghosal-test.apigee.net/rideshare/canceloffer?uuid=" + row.uuid;
    $http({
      method: 'GET',
      url: cancelURL
    }).then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
      $scope.spinner = false;
      alert("Successfully Cancelled.")
      $scope.uuid = row.uuid;
      $scope.cancel = true;
      $scope.result = "Successfully Cancelled This Offer";
      var offerDate = new Date(row.time);     
      $scope.SendPush(row, "I have cancelled the ride from " + 
      row.from_place + " to " + row.to_place + " with start time " + $filter('date')(offerDate, 'medium')  + ". - " + row.offeredby);
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


$scope.SendPush = function (row, text) { 
    //   $scope.uuid = ''; 
    //    $scope.GetRideAcceptances(row); 
//    alert(text);
    $scope.spinner = true;
 /*   
    if(!angular.isObject(row.passengers) || !angular.isArray(row.passengers) || row.passengers.length <= 0){
      alert("No passengers have accepted this ride offer so far");
      return;
    }
    var users = [];
    var passengers = [];
    passengers = JSON.parse(JSON.stringify(row.passengers));
    for(var i=0; +i<passengers.length; +i++) {
      var user = passengers[+i];
      users.push(user.passenger_uuid);     
     } */
//    var notifyURL = encodeURI("http://sujoyghosal-test.apigee.net/rideshare/notifyoffercancel?userids=" 
//            + JSON.stringify(users) + "&text=" + text);
    var notifyURL = encodeURI("http://sujoyghosal-test.apigee.net/sendpush/devicespush?regids=APA91bFlfhBLOgGXVij5RZyojydpiMFnNXTEk4fa-zWALSjUArxIaK1fWKZEllHzs2ztVDAY6P8mpZnPuXDxKYHoi3ZIRRwlZzTqigxEp6TOc32VcFM1gfiQHsMLj8r9btENAiaqcGBP&text=" + text);
     
    $http({
      method: 'GET',
      url: notifyURL
    }).then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
      $scope.spinner = false;
      alert("Successfully Sent Push Messages to All Passengers.");      
      $scope.uuid = row.uuid;
      $scope.cancel = true;
      $scope.result = "Successfully Sent Cancellation Message to All Passengers.";
    }, function errorCallback(error) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      $scope.spinner = false;
      $scope.result = "Could not send push messages. ";
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
//  $scope.fullname = '';
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
        console.log("Obj Email=" + obj.email);
        $location.path("/home");
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
  