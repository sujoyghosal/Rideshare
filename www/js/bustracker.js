var express = require('express');
var usergrid = require('usergrid');
//var config = require('./config');

// Set up Express environment and enable it to read and write JavaScript
var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    }
    else {
      next();
    }
};
var app = express();
app.use(allowCrossDomain);
//app.use(express.bodyParser());
app.use(express.urlencoded());
app.use(express.json());
// Initialize Usergrid

var ug = new usergrid.client({
        'orgName': 'sujoyghosal',
        'appName': 'routes',
        'clientId': 'b3U61KVA2tT2EeOCE8Gxrag6ig',
        'clientSecret': 'b3U6QV4J01fqqWS23jzFwa4fm5jUPl0',
    logging: true
});

var loggedIn = null;

// The API starts here

// GET / 

var rootTemplate = {
    'routes': {
        'href': './routes'
    }
};


app.get('/', function (req, resp) {
    //    resp.jsonp(rootTemplate);
    out = "Hey, are you looking for something?";
    out += "  Use /allroutes to get all routes or createroutes with name=value pairs to create a routes";
    resp.jsonp(out);
});

// GET 
var userid;
app.get('/allroutes', function (req, res) {
    res.header("Access-Control-Allow-Origin", "*");
    if (loggedIn === null) {
        logIn(req, res, getroutes);
    } else {
        //      userid = req.param('userid');
        getroutes(req, res);
    } //qs:{ql:"name='bread' or uuid=b3aad0a4-f322-11e2-a9c1-999e12039f87"}
});

var options = {
    type: "routes"
    //     qs : {"ql": "user_id='" + userid + "'"}
};
//Call request to initiate the API call

function getroutes(req, res) {

    loggedIn.createCollection({
        type: 'routes?limit=100'
    }, function (err, routes2) {
        if (err) {
            res.jsonp(500, {
                'error': JSON.stringify(err)
            });
            return;
        }

        var allroutes = [];
        while (routes2.hasNextEntity()) {
            var aroute = routes2.getNextEntity().get();
            allroutes.push(aroute);
        }
        res.jsonp(allroutes);
    });
}


// POST /routes

app.get('/createroute', function (req, res) {

    var b = req.body;
    var e = {
        'name': req.param('routename'),
            'type': 'routes',
            'description': req.param('description'),
            'bus_locations': [{
            'bus_id': req.param('busID'),
                'location': {
                'bus_latitude': req.param('buslatitude'),
                    'bus_longitude': req.param('buslongitude')
            }
        }],
            'bus_stops': [{
            'stop_name': req.param('stopname'),
            'stop_address': req.param('stopaddress'),
                'street': req.param('street'),
                'address_line2': req.param('address_line2'),
                'city': req.param('city'),
                'state': req.param('state'),
                'country': req.param('country'),
                'postal_code': req.param('postalcode'),
                'prev_stop': req.param('prevstop'),
                'location': {
                'latitude': req.param('latitude'),
                    'longitude': req.param('longitude')
            }
        }]
    };
        var newstop = {
            'stop_name': req.param('stopname'),
            'stop_address': req.param('stopaddress'),
                'street': req.param('street'),
                'address_line2': req.param('address_line2'),
                'city': req.param('city'),
                'state': req.param('state'),
                'country': req.param('country'),
                'postal_code': req.param('postalcode'),
                'prev_stop': req.param('prevstop'),
                'location': {
                'latitude': req.param('latitude'),
                    'longitude': req.param('longitude')
            }};

    if (loggedIn === null) {
        logIn(req, res, function () {
            createOrUpdateRoute(e,newstop, req, res);
            
        });
    } else {
        createOrUpdateRoute(e,newstop, req, res);
    }
});

function createOrUpdateRoute(e,newstop,req,res){
    var options = {
        type: "routes",
        name: req.param('routename')
    };
    loggedIn.getEntity(options, function (err, route) {
        if (err) {
            createRoute(e, req, res)
            return;
        } else {
            
            route._data.bus_stops.push(newstop);
            route.save(function(err){
            if (err){
                res.jsonp(500, err);
                return;
            } else {
                res.send(201);
            }
            });
        }
    });
}
function createRoute(e, req, res) {
    var opts = {
        type: 'routes'
    };
    
    loggedIn.createEntity(e, function (err, o) {
        if (err) {
            res.jsonp(500, err);
            return;
        } else {
            res.send(201);
        }

        //        o.set(e);
        //        o.save(function(err) {
        //            if (err) {
        //              res.jsonp(500, err);
        //              return;
        //            }

        //           res.send(201);
        //        });
    });
}




app.get('/createuser', function (req, res) {

    var name = req.param('email');
    var password = req.param('password');
    var email = req.param('email');
    var username = req.param('email');

    var options = {
        method: 'POST',
        endpoint: 'users',
        body: {
            username: username,
            name: name,
            email: email,
            password: password
        }
    };


    if (loggedIn === null) {
        logIn(req, res, function () {
            createUser(options, req, res);
        });
    } else {
        createUser(options, req, res);
    }
});

function createUser(e, req, res) {
    loggedIn.request(e, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(201);
        }
    });
}

app.get('/registercompany', function (req, res) {

    var name = req.param('name');
    var address = req.param('address');
    var email = req.param('email');
    var phone = req.param('phone');

    var options = {
        method: 'POST',
        endpoint: 'merchant',
        body: {
            address: address,
            name: name,
            email: email,
            phone: phone
        }
    };


    if (loggedIn === null) {
        logIn(req, res, function () {
            registerCompany(options, req, res);
        });
    } else {
        registerCompany(options, req, res);
    }
});

function registerCompany(e, req, res) {
    loggedIn.request(e, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(201);
        }
    });
}
app.get('/updateroute', function (req, res) {

    var jsonObject = req.param('bus_stops');
    var parsedJSON = JSON.parse(jsonObject);
    var options = {
        type: 'routes',
        uuid: req.param('uuid')
    };
    //	res.send(parsedJSON);
    if (loggedIn === null) {
        logIn(req, res, function () {
            updateRoute(options, parsedJSON, req, res);
        });

    } else {
        updateRoute(options, parsedJSON, req, res);

    }
});

/*    var entity = new usergrid.entity(properties);

    //Call Entity.save() to initiate the API PUT request
    entity.save(function (error, result) {
        if (err) {
            res.send(err);
        } else {
            res.send(201);
        }
    });*/

function updateRoute(options, parsedJSON, req, res) {
    loggedIn.getEntity(options, function (err, entity) {
        if (err) {
            res.send(err);
        } else {
            res.send(entity);
            entity.set('bus_stops', parsedJSON.bus_stops);
            entity.save(function (err) {
                if (err) {
                    res.jsonp(500, err);
                    return;
                }

                res.send(201, "Success");
            });
        }
    });
}

// POST /profile

app.get('/sendcurrentbuslocation', function (req, res) {
    /*	if (!req.is('json')) {
		res.jsonp(400, {
			error : 'Bad request'
		});
		return;
	}

	var b = req.body;*/
    var e = {
        'id': req.param('id'),
            'routeName': req.param('route'),
            'location': {
            'latitude': req.param('latitude'),
                'longitude': req.param('longitude')
        }

    };

    if ((e.id === undefined) || (e.routeName === undefined) || (e.location === undefined) || (e.location === undefined)) {
        res.jsonp(400, {
            error: 'Bad request'
        });
        return;
    }
//	res.send(e);
  if (loggedIn === null) {
        logIn(req, res, function () {
            createBusLocation(e, req, res);
        });
    } else {
        createBusLocation(e, req, res);
    }
    
});

function createBusLocation(e, req, res) {
  	var clName = e.routeName + '-' + e.id;
    var opts = {
        type: 'currentlocations',
        name: clName
    };

    loggedIn.createEntity(opts, function (err, o) {
        if (err) {
            res.jsonp(500, err);
            return;
        }
        o.set(e);
        o.save(function (err) {
            if (err) {
                res.jsonp(500, err);
                return;
            }
            res.send(o);
        });
    });
}

// GET /buslocations
var options2 = '';
app.get('/getcurrentbuslocations', function (req, res) {
    routename = req.param('route');

    options2 = {
        type: "currentlocations?limit=20",
        qs: {
            "ql": "routeName='" + routename + "'"
        }
    };
    if (loggedIn === null) {
        logIn(req, res, getCurrentBusLocations);
    } else {
        getCurrentBusLocations(req, res);
    }
});

function getCurrentBusLocations(req, res) {

    loggedIn.createCollection(options2, function (err, buses) {
        if (err) {
            res.jsonp(500, {
                'error': JSON.stringify(err)
            });
            return;
        }

        var allbuses = [];
        while (buses.hasNextEntity()) {
            var aBus = buses.getNextEntity().get();
            allbuses.push(aBus);
        }
        res.jsonp(allbuses);
    });
}
app.get('/creategroup', function (req, res) {

    var group = req.param('group');

    var options = {
        method: 'POST',
        endpoint: 'groups',
        body: {
            path: group
        }
    };


    if (loggedIn === null) {
        logIn(req, res, function () {
            createGroup(options, req, res);
        });
    } else {
        createGroup(options, req, res);
    }
});

function createGroup(e, req, res) {
    loggedIn.request(e, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(201);
        }
    });
}

app.get('/addusertogroup', function (req, res) {

    var group = req.param('group');
    var user = req.param('user');
    var options = {
        method: 'POST',
        endpoint: 'groups/' + group + '/users/' + user
    };


    if (loggedIn === null) {
        logIn(req, res, function () {
            addUserToGroup(options, req, res);
        });
    } else {
        addUserToGroup(options, req, res);
    }
});

function addUserToGroup(e, req, res) {
    loggedIn.request(e, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(data);
        }
    });
}

app.get('/addusertodevice', function (req, res) {

    var deviceid = req.param('deviceid');
    var uuid = req.param('uuid');
    var options = {
        method: 'POST',
        endpoint: 'users/' + uuid + '/devices/' + deviceid
    };


    if (loggedIn === null) {
        logIn(req, res, function () {
            addUserToDevice(options, req, res);
        });
    } else {
        addUserToDevice(options, req, res);
    }
});

function addUserToDevice(e, req, res) {
    loggedIn.request(e, function (err, data) {
        if (err) {
            res.send(err);
        } else {
            res.send(201);
        }
    });
}

app.get('/sendpushtogroup', function (req, res) {

    var grouppath = req.param('grouppath');
    var notifier = req.param('notifier');
    var message = req.param('message');
    var options = {
        method: 'POST',
        endpoint: '/groups/' + grouppath + '/notifications/',
        body: {
            'payloads': {
                'stopnotifier': message
            }
        }
    };


    if (loggedIn === null) {
        logIn(req, res, function () {
            sendPushToGroup(options, req, res);
        });
    } else {
        sendPushToGroup(options, req, res);
    }


    function sendPushToGroup(e, req, res) {
        loggedIn.request(e, function (err, data) {
            if (err) {
                res.send(err);
            } else {
                res.send(201);
            }
        });
    }
});

/* POST /subscriptions
var jsonObject = "";
app.get('/subscribe', function (req, res) {

    var b = req.body;
    jsonObject = req.param('subscriptions');
    if (loggedIn === null) {
        logIn(req, res, function () {
            createSubscriptions(req, res);
        });
    } else {
        createSubscriptions(req, res);
    }
});

function createSubscriptions(req, res) {
    var opts = {
        type: 'subscriptions'
    };

    var data = "";
    var parsedJSON = JSON.parse(jsonObject);
    for (var i = 0; i < parsedJSON.subscriptions.length; i++) {
        var oneSubscription = parsedJSON.subscriptions[i];
        data = {
            'route_name': oneSubscription.route_name,
                'stop_name': oneSubscription.stop_name
        };

        loggedIn.createEntity(opts, function (err, o) {
            if (err) {
                res.jsonp(500, err);
                return;
            }
            o.set(data);
            o.save(function (err) {
                if (err) {
                    res.jsonp(500, err);
                    return;
                }

            }); //save


        }); //createEntity
    } //for loop
    res.send(201);

}*/

var jsonObject = "";
app.get('/myconnect', function (req, res) { //does not work

    var b = req.body;
    subscribed = req.param('name');
    deviceID = req.param('deviceid');
    if (loggedIn === null) {
        logIn(req, res, function () {
            createConnection(req, res, subscribed, deviceID);
        });
    } else {
        createConnection(req, res, subscribed, deviceID);
    }
});

function createConnection(req, res, subscribed_name, device_id) {
    var connecting_entity_options = {
        client: loggedIn,
        data: {
            type: 'subscriptions',
            name: subscribed_name
        }
    };

    var connecting_entity = new Usergrid.entity(connecting_entity_options);

    // create an entity object that models the entity being connected to
    var connected_entity_options = {
        client: loggedIn,
        data: {
            type: 'devices',
            uuid: device_id
        }
    };
    var connected_entity = new Usergrid.entity(connected_entity_options);
    var resp = '';
    // the connection type
    var relationship = 'subscribed_device';
    // send the POST request
    loggedIn.connect(relationship, connected_entity, function (error, result) {

        if (error) {
            res.jsonp(500, err);
            return;

        } else {
            // Success
            res.jsonp(200, 'Success');
            return;

        }

    });
    //   res.send(201);
}

// GET subscriptions by route name and stop name 
var routename = null;
var options2 = null;
app.get('/getsubscriptions', function (req, res) {
    routename = req.param('routename');
    stopname = req.param('stopname');
    options2 = {
        type: "subscriptions?limit=1000",
        qs: {
            "ql": "route_name='" + routename + "' AND stop_name='" + stopname + "'"
        }
    };
    if (loggedIn === null) {
        logIn(req, res, getsubscriptions);
    } else {
        getsubscriptions(req, res);
    } //qs:{ql:"name='bread' or uuid=b3aad0a4-f322-11e2-a9c1-999e12039f87"}
});

function getsubscriptions(req, res) {

    loggedIn.createCollection(options2, function (err, routes) {
        if (err) {
            res.jsonp(500, {
                'error': JSON.stringify(err)
            });
            return;
        }

        var allroutes = [];
        while (routes.hasNextEntity()) {
            var aroute = routes.getNextEntity().get();
            allroutes.push(aroute);
        }
        res.jsonp(allroutes);
    });
}

// GET route by name
var routename = null;
var options2 = null;
app.get('/getroute', function (req, res) {
    routename = req.param('routename');
    options2 = {
        type: "routes?limit=100",
        qs: {
            "ql": "name='" + routename + "'"
        }
    };
    if (loggedIn === null) {
        logIn(req, res, getroutebyname);
    } else {
        getroutebyname(req, res);
    } //qs:{ql:"name='bread' or uuid=b3aad0a4-f322-11e2-a9c1-999e12039f87"}
});


//Call request to initiate the API call

function getroutebyname(req, res) {

    loggedIn.createCollection(options2, function (err, routes) {
        if (err) {
            res.jsonp(500, {
                'error': JSON.stringify(err)
            });
            return;
        }

        var allroutes = [];
        while (routes.hasNextEntity()) {
            var aroute = routes.getNextEntity().get();
            allroutes.push(aroute);
        }
        res.jsonp(allroutes);
    });
}

// GET user by email
var routename = null;
var options2 = null;
app.get('/getuser', function (req, res) {
    useremail = req.param('email');
    options2 = {
        type: "users",
        qs: {
            "ql": "name='" + useremail + "'"
        }
    };
    if (loggedIn === null) {
        logIn(req, res, getuserbyemail);
    } else {
        getuserbyemail(req, res);
    } //qs:{ql:"name='bread' or uuid=b3aad0a4-f322-11e2-a9c1-999e12039f87"}
});


//Call request to initiate the API call

function getuserbyemail(req, res) {

    loggedIn.createCollection(options2, function (err, users) {
        if (err) {
            res.jsonp(500, {
                'error': JSON.stringify(err)
            });
            return;
        }

        var allusers = [];
        while (users.hasNextEntity()) {
            var auser = users.getNextEntity().get();
            allusers.push(auser);
        }
        res.jsonp(allusers);
    });
}


// Delete Subscription by name
var deviceid2 = null;
var options2 = null;
app.get('/deletesubscription', function (req, res) {
    deviceid2 = req.param('name');
    options2 = {
        type: "routes?limit=100",
        qs: {
            "ql": "route_name='" + routename + "'"
        }
    };
    if (loggedIn === null) {
        logIn(req, res, deletesubscriptionbyname);
    } else {
        deletesubscriptionbyname(req, res);
    } //qs:{ql:"name='bread' or uuid=b3aad0a4-f322-11e2-a9c1-999e12039f87"}
});


//Call request to initiate the API call

function deletesubscriptionbyname(req, res) {

    var properties = {
        client: loggedIn,
        data: {
            'type': 'subscriptions',
                'name': deviceid2
        }
    };

    //create the entity object
    var entity = new usergrid.entity(properties);

    //call destroy() to initiate the API DELETE request
    entity.destroy(function (error, result) {

        if (error) {
            // Error
            res.send(error);
        } else {
            res.send(202);
        }

    });

}

var geo_query = '';
app.get('/getbusesnearme', function (req, res) {
    var criteria = 'location within ' + req.param('radius') + ' of ' + req.param('latitude') + ', ' + req.param('longitude');
    var count = 100;
    if (req.param('nearest') === '') {
        count = 100;
    } else {
        count = req.param('nearest');
    }
    geo_query = {
        type: "currentlocations?limit=" + count, //Required - the type of collection to be retrieved
        qs: {
            "ql": criteria
        }
    };

    if (loggedIn === null) {
        logIn(req, res, getmynearestbuses);
    } else {
        getmynearestbuses(req, res);
    }

});

function getmynearestbuses(req, res) {

    loggedIn.createCollection(geo_query, function (err, buses) {
        if (err) {
            res.jsonp(500, {
                'getmynearestbuses_error': JSON.stringify(err)
            });
            return;
        }

        var allbuses = [];
        while (buses.hasNextEntity()) {
            var aBus = buses.getNextEntity().get();
            allbuses.push(aBus);
        }
        res.jsonp(allbuses);
    });
}

var login_query = '';


// We need this for UserGrid authentication

function logIn(req, res, next) {
    console.log('Logging in as %s', 'sujoyghosal');
    ug.login('sujoyghosal', 'Kolkata1', function (err) {
        if (err) {
            console.log('Login failed: %s', JSON.stringify(err));
            res.jsonp(500, {
                error: err
            });
            return;
        }

        loggedIn = new usergrid.client({
            'orgName': 'sujoyghosal',
                'appName': 'routes',
                'authType': usergrid.AUTH_APP_USER,
                'token': ug.token,
            logging: true
        });

        console.log("Got a token. I wonder when it expires? Let's guess.");

        // Go on to do what we were trying to do in the first place
        setTimeout(expireToken, 6000);

        next(req, res);
    });
}

function expireToken() {
    console.log('Getting rid of user authentication token');
    if (loggedIn !== null) {
        loggedIn.logout();
        loggedIn = null;
    }
}

// Listen for requests until the server is stopped

app.listen(9000);
console.log('Listening on port 9000');