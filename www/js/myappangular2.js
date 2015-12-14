var app = angular.module('myApp', []);
app.config(['$routeProvider',
  function ($routeProvider) {
    $routeProvider.
      when('/', {
        templateUrl: '/frameb.html',
//        controller: 'RidesCtrl'
      }).
      when('/GetRide', {
        templateUrl: '/GetRide.html',
        controller: 'RidesCtrl'
      }).
      when('/OfferRide', {
        templateUrl: '/OfferARide.html',
        controller: 'CreateRideCtrl'
      }).
      otherwise({
        redirectTo: '/OfferRide'
      });
  }]);
app.controller('CreateRideCtrl', function ($scope, $http) {
  var today = new Date().toISOString().slice(0, 10);
  $scope.today = {
    value: today
  };
  $scope.maxDate = {
    value: new Date(2015, 12, 31, 14, 57)
  };    
  //var datetime = $filter('date')(new Date(offer.time));
     
  $scope.SendOffer = function (offer) {

    var sendURL = "http://sujoyghosal-test.apigee.net/rideshare/createrideshare?email="
      + offer.email.toUpperCase().trim() + "&offeredby=" + offer.name.toUpperCase().trim() + "&phone_number=" + offer.phone.toUpperCase().trim() + "&time=" + offer.time + "&city="
      + offer.city.toUpperCase().trim() + "&status=ACTIVE" + "&from_place=" + offer.from.toUpperCase().trim() + "&to_place=" + offer.to.toUpperCase().trim() + "&via=" + offer.via.toUpperCase().trim() + "&maxcount=" + offer.maxcount;
    //   alert(row.uuid);
    $http({
      method: 'GET',
      url: sendURL
    }).then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available           
      $scope.status = response.statusText;
      alert("Offer " + response.statusText);

    }, function errorCallback(error) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      $scope.status = error.statusText;
    });
  };
});

app.controller('RidesCtrl', function ($scope, $http) {

  $scope.allrides = false;
  $scope.cityRides = '';
  $scope.cancel = false;
  $scope.uuid = '';
  var param_name = '';
  var login_email = '';


  $scope.GetRides = function (paramname, paramvalue) {

    if (!paramname || !paramvalue)
      return;
    param_name = paramname.trim();
    var getURL = "http://sujoyghosal-test.apigee.net/rideshare/getrides?paramname="
      + param_name + "&paramvalue=" + paramvalue.trim();
     
    //   alert(row.uuid);
    $http({
      method: 'GET',
      url: getURL
    }).then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
                  
      $scope.cityRides = response.data;
      // $scope.found  = "Active ride offers for " + param_name;
      $scope.allrides = true;
      $scope.cancel = false;
    }, function errorCallback(error) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      $scope.found = "Could not submit acceptance. " + error;
      $scope.allrides = false;
    });

  };
  $scope.AcceptRide = function (row) {
    $scope.uuid = '';
    $scope.found = '';

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
      $scope.acceptedRide = "Could not submit acceptance. " + error;
      $scope.cancel = false;
    });

  };
  var accepts = [];

  $scope.GetRideAcceptances = function (row, cancel) {
    var acceptsURL = "http://sujoyghosal-test.apigee.net/rideshare/getrideacceptances?uuid=" + row.uuid;
    $http({
      method: 'GET',
      url: acceptsURL
    }).then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
      accepts = response.data.entities;
      if (cancel)
        $scope.CancelRide(row, false);
    }, function errorCallback(error) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      $scope.found = "Could not submit acceptance. " + error;
      $scope.accepted = false;
    });

  };
  $scope.CompareDate = function (date) {
    var now = new Date();
    var date1 = new Date(date);
    if (date1.getTime() > now.getTime())
      return true;
    else
      return false;
  }

  $scope.GetMyAcceptedRides = function (email) {

    var getURL = "http://sujoyghosal-test.apigee.net/rideshare/acceptedrides?email=" + email.trim();
    $http({
      method: 'GET',
      url: getURL
    }).then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
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
      $scope.found = "Oops! There was a problem. " + error;
      $scope.allrides = false;
    });

  };
  $scope.CancelOffer = function (row) { 
    //   $scope.uuid = ''; 
    //    $scope.GetRideAcceptances(row);    
    var cancelURL = "http://sujoyghosal-test.apigee.net/rideshare/canceloffer?uuid=" + row.uuid;
    $http({
      method: 'GET',
      url: cancelURL
    }).then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
      alert("Successfully Cancelled.")
      $scope.uuid = row.uuid;
      $scope.cancel = true;
      $scope.GetRides("email", 'sujoy.ghosal4@gmail.com');
      $scope.found = "Successfully Cancelled This Offer";
    }, function errorCallback(error) {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      $scope.found = "Could not cancel. " + cancelURL;
      $scope.accepted = false;
      $scope.uuid = row.uuid;
      $scope.cancel = false;
      return;
    });
  };
  $scope.showList = function (listData) {
    // Make a container element for the list - which is a <div>
    // You don't actually need this container to make it work
    var listContainer = document.createElement("div");

    // add it to the page
    document.getElementsByTagName("body")[0].appendChild(listContainer);

    // Make the list itself which is a <ul>
    var listElement = document.createElement("ul");

    // add it to the page
    listContainer.appendChild(listElement);

    // Set up a loop that goes through the items in listItems one at a time
    var numberOfListItems = listData.length;

    for (var i = 0; i < numberOfListItems; ++i) {
                
      // create a <li> for each one.
      var listItem = document.createElement("li");

      // add the item text
      listItem.innerHTML = listData[i];

      // add listItem to the listElement
      listElement.appendChild(listItem);
    };
  }
  $scope.CancelRide = function (row, responseAsMessage) { 
    //   $scope.uuid = ''; 
    //    $scope.GetRideAcceptances(row);    
    var cancelURL = "http://sujoyghosal-test.apigee.net/rideshare/cancelacceptedride?uuid=" + row.uuid + "&passenger_email=login@wipro.com";
    $http({
      method: 'GET',
      url: cancelURL
    }).then(function successCallback(response) {
      // this callback will be called asynchronously
      // when the response is available
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