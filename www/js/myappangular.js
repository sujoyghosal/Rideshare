var app = angular.module('myApp', ['ngRoute']);
app.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider.
      when('/login', {
        templateUrl: 'Login.html',
        controller: 'LoginCtrl'
      }).
      when('/home', {
        templateUrl: 'mainmenu.html',
        controller: 'NavBarCtrl'
      }).

      when('/register', {
        templateUrl: 'Register.html',
        controller: 'RegisterCtrl'
      }).
      when('/getride', {
        templateUrl: 'GetRide.html',
        controller: 'RidesCtrl'
      }).
      when('/offerride', {
        templateUrl: 'OfferARide.html',
        controller: 'OfferRideCtrl'
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
  };

  var getLoggedIn = function () {
    return loggedinUser;
  };

  return {
    setLoggedIn: setLoggedIn,
    getLoggedIn: getLoggedIn
  };
});
app.controller('mainController', function () { });
app.controller('NavBarCtrl', function () { });
app.controller('OfferRideCtrl', function ($scope, $http) {
  $scope.spinner = false;
  var today = new Date().toISOString().slice(0, 10);
  $scope.today = {
    value: today
  };
  $scope.maxDate = {
    value: new Date(2015, 12, 31, 14, 57)
  };
  $scope.SendOffer = function (offer) {
    $scope.spinner = true;
    var sendURL = "http://sujoyghosal-test.apigee.net/rideshare/createrideshare?email="
      + offer.email + "&offeredby=" + offer.name + "&phone_number=" + offer.phone + "&time=" + offer.time + "&city=" + offer.city + "&status=ACTIVE"
      + "&from_place=" + offer.from + "&to_place=" + offer.to + "&via=" + offer.via + "&maxcount=" + offer.maxcount;
    //   alert(row.uuid);
    $http({
      method: 'GET',
      url: sendURL
    }).then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available         
      $scope.spinner = false;  
      $scope.status = response.statusText;
      alert("Offer " + response.statusText);

    }, function errorCallback(error) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      $scope.spinner = false;
      $scope.status = error.statusText;
    });
  };
});

app.controller('RidesCtrl', function ($scope, $http, UserService) {
  $scope.spinner = false;
  $scope.allrides = false;
  $scope.cityRides = '';
  $scope.cancel = false;
  $scope.uuid = '';

  $scope.login_email = UserService.getLoggedIn();


  var param_name = '';
  $scope.GetRides = function (paramname, paramvalue) {
    $scope.spinner = true;
    if (!paramname || !paramvalue)
      return;
    param_name = paramname.trim();
    var getURL = "http://sujoyghosal-test.apigee.net/rideshare/getrides?paramname="
      + param_name + "&paramvalue=" + paramvalue.trim();
    getURL = encodeURI(getURL);
    //   alert(row.uuid);
    $http({
      method: 'GET',
      url: getURL
    }).then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
      $scope.spinner = false;
      $scope.cityRides = response.data;
      // $scope.found  = "Active ride offers for " + param_name;
      $scope.allrides = true;
      $scope.cancel = false;
    }, function errorCallback(error) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      $scope.spinner = false;
      $scope.found = "Could not submit acceptance. " + error;
      $scope.allrides = false;
    });

  };
  $scope.AcceptRide = function (row) {
    $scope.uuid = '';
    $scope.found = '';
    $scope.spinner = true;
    var updateURL = "http://sujoyghosal-test.apigee.net/rideshare/acceptride?uuid=" + row.uuid
      + "&passenger_name=Login"
      + "&passenger_phone=8888888888"
      + "&passenger_email=login@wipro.com";
    //   alert(row.uuid);
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
        $scope.found = response.data;
        $scope.uuid = row.uuid;
        $scope.allrides = true;
        $scope.cancel = true;
        return;
      } else {
        $scope.found = "Successfully Accepted ride from " + row.from_place + " to "
        + row.to_place + " in " + row.city + " on " + row.time + " offered by " + row.offeredby + " (phone: " + row.phone_number + ").";
        $scope.GetRides("city", row.city);
        $scope.uuid = row.uuid;
        $scope.allrides = true;
        $scope.cancel = true;
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
      $scope.found = "Could not submit acceptance. " + error;
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
        $scope.found = response.data;
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
      $scope.GetRides("email", 'sujoy.ghosal4@gmail.com');
      $scope.found = "Successfully Cancelled This Offer";
    }, function errorCallback(error) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      $scope.spinner = false;
      $scope.found = "Could not cancel. " + cancelURL;
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
    var cancelURL = "http://sujoyghosal-test.apigee.net/rideshare/cancelacceptedride?uuid=" + row.uuid + "&passenger_email=login@wipro.com";
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
      $scope.found = "Cancelled ride";
    }, function errorCallback(error) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      $scope.spinner = false;
      $scope.found = "Could not cancel. ";
      $scope.accepted = false;
      $scope.uuid = row.uuid;
      $scope.cancel = false;
    });
  };

});
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

app.controller('LoginCtrl', function ($scope, $http, $location, UserService) {
  $scope.spinner = false;
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
        alert("Id Found");
        $scope.loginResult = response.data[0].username;
        $location.path("/home");
        UserService.setLoggedIn(login.email);
        return;
      }
    }, function errorCallback(error) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      //      $scope.loginResult = "Could not submit login request.." + error;
      $scope.spinner = false;
      $scope.loginResult = "Could not submit request.." + error;
    });
  };
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
        UserService.setLoggedIn(user.fullname);
        $location.path("/home");
        return;
      } else {
        $scope.result = response;
        alert("Email Id Exists..");
        UserService.setLoggedIn(user.fullname);
        $location.path("/home");
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
  