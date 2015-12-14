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
    'appName': 'rideshare',
    'clientId': 'YXA6cRy90I7XEeW3w8FZA2DhQg',
    'clientSecret': 'YXA6klSQuhhDc30tyosetUTaP_HAaFY',
    logging:    true
});

var loggedIn = null;

// The API starts here

// GET / 

var rootTemplate = {
  'rideshare': { 'href': './rideshare' }
};


app.get('/', function(req, resp) {
//    resp.jsonp(rootTemplate);
  	  out = "Hey, are you looking for something?";
      out += "  Use /allrideshare to get all rideshare or createrideshare with name=value pairs to create a rideshare";
      resp.jsonp(out);      
});

// GET 
var userid;
app.get('/allrideshare', function(req, res) {
    if (loggedIn === null) {
      logIn(req, res, getrideshare);
    } else {
      userid = req.param('userid');
      getrideshare(req, res);
    }//qs:{ql:"name='bread' or uuid=b3aad0a4-f322-11e2-a9c1-999e12039f87"}
});

var options = {
      type: "wiprorideshares?limit=100",
      qs : {"ql": "user_id='" + userid + "'"}
    };
//Call request to initiate the API call

function getrideshare(req, res) {
     
  loggedIn.createCollection({ type: 'wiprorideshares?limit=100' }, function(err, rideshare) {
//    loggedIn.createCollection(options, function(err, ngccnotifications) {
//  loggedIn.request({ options, function(err, ngccnotifications) {      
        if (err) {
          res.jsonp(500, {'error': JSON.stringify(err) });
          return;
        }
        
        var allrideshare = [];
        while (rideshare.hasNextEntity()) {
          var arideshare = rideshare.getNextEntity().get();
          allrideshare.push(arideshare);
        }
        res.jsonp(allrideshare);
    });
}

var rides_query='';
app.get('/getrides', function(req, res) {
    paramname = req.param('paramname');
    paramvalue = req.param('paramvalue');
    rides_query = {
		type:"wiprorideshares?limit=100", //Required - the type of collection to be retrieved
          qs: {"ql": paramname +"='" + paramvalue + "'"}
	};
	if(paramname === 'uuid'){
	 rides_query = {
		"type":"wiprorideshares", //Required - the type of collection to be retrieved
        "uuid": paramvalue
	};
	}
    if (loggedIn === null) {
      logIn(req, res, getrides);
    } else {
      getrides(req, res);
    }//qs:{ql:"name='bread' or uuid=b3aad0a4-f322-11e2-a9c1-999e12039f87"}
});


function getrides(req, res) {
  loggedIn.createCollection(rides_query, function(err, rideshare) {
        if (err) {
          res.jsonp(500, {'error': JSON.stringify(err) });
          return;
        }
        var allrideshare = [];
        while (rideshare.hasNextEntity()) {
          var arideshare = rideshare.getNextEntity().get();
          allrideshare.push(arideshare);
        }
        res.jsonp(allrideshare);
    });
}
var uuid='';
var currentcount='';
var maxcount='';
var updateoptions='';
var passenger={};
var acceptoptions='';

app.get('/updatecount', function(req, res) {
    uuid = req.param('uuid');
    currentcount = req.param('currentcount');
    currentcount = +currentcount + 1;
    maxcount = req.param('maxcount');
    passenger = {
	    "passenger_name": req.param('passenger_name'),
        "passenger_phone": req.param('passenger_phone'),
        "passenger_email": req.param('passenger_email'),
        "passenger_dept": req.param('passenger_dept')
	};
    updateoptions = {
		"type": "wiprorideshares", //Required - the type of collection to be retrieved
        "uuid": uuid,
        "cuurentcount": currentcount
	};
	var acname = uuid + req.param('passenger_email');
	acceptoptions = {
        "rideid": uuid,
        "name": acname,
        "passenger": passenger,
        "status": "accepted"
	};
/*    if (loggedIn === null) {
      logIn(req, res, updatecount);
    } else {
      userid = req.param('userid');
      updatecount(req, res);
    }*///qs:{ql:"name='bread' or uuid=b3aad0a4-f322-11e2-a9c1-999e12039f87"}
    if (loggedIn === null) {
        logIn(req, res, function() {
            acceptRide(acceptoptions,updateoptions, req, res);
        });
    } else {
        acceptRide(acceptoptions,updateoptions, req, res);
    }
});


function updatecount(incr, req, res) {
     
  loggedIn.getEntity(updateoptions, function(err, rideshare) {
//    loggedIn.createCollection(options, function(err, ngccnotifications) {
//  loggedIn.request({ options, function(err, ngccnotifications) {      
        if (err) {
          res.jsonp(500, {'error': JSON.stringify(err) });
          return;
        }
        
//        res.jsonp(rideshare);
//        return;

        var currentcount = rideshare.get('currentcount');
        var maxcount = rideshare.get('maxcount');
        currentcount = +currentcount + (+incr);
        if(+currentcount <= +maxcount && +currentcount >= 0)
            rideshare.set('currentcount', +currentcount);
        if(+currentcount == +maxcount){
            res.jsonp("Reached max count " + maxcount);
        }
        
//        rideshare.set('passengers',  passengers);
        rideshare.save(function(err){
        if (err){
        //error - user not updated
        //  res.jsonp(500, {'error': JSON.stringify(err) });
        res.send("Damn! Error Saving Object!");
          return;
        } else {
        //success - user updated
           res.jsonp(rideshare);
        }
        });
    });
}
function acceptRide(e, updateoptions, req, res) {
    var opts = {
        type: 'acceptedrides',
//        name: 'Dominos' 
    };
    loggedIn.createEntity(opts, function(err, o) {
        if (err) {
            res.jsonp(500, err);
            return;
        }
        o.set(e);
        o.save(function(err) {
            if (err) {
 //             res.jsonp(500, err);
            res.send("Already Accepted!")
              return;
            }
            var opts = {
                type: 'wiprorideshares',
//        name: 'Dominos' 
            };
            loggedIn.createEntity(opts, function(err, p) {
                if (err) {
                    res.jsonp(500, err);
                    return;
                }
                p.set(updateoptions);
                p.connect('accepted', o, function (err, data) {
                if (err) {
                    // error - connection not created
                } else {
                    if (loggedIn === null) {
                      logIn(req, res, function() {
                        updatecount(1, req, res);
                     });
                    } else {
                      updatecount(1,req, res);
                    }
                    res.send(data);
                }
            });
        });
    });
    
    });
}
// POST /rideshare
var accept_options='';
app.get('/getrideacceptances', function(req, res){
    var uuid = req.param('uuid');
    var accept_options = {
		"type": "wiprorideshares", //Required - the type of collection to be retrieved
        "uuid": uuid
	};
    if (loggedIn === null) {
        logIn(req, res, function() {
            getrideacceptances(accept_options, req, res);
        });
    } else {
        getrideacceptances(accept_options, req, res);
    }
});

function getrideacceptances(accept_options, req, res){
            
            loggedIn.getEntity(accept_options, function(err, p) {
                if (err) {
                    res.jsonp(500, err);
                    return;
                }
            //    p.set(accept_options);
                p.getConnections('accepted', function (err, data) {
                if (err) {
                    // error - connection not created
                    res.send("Could not get Connections - " + err)
                } else {
                    
                    res.jsonp(data);
                }
                });
                });
}

var arides_query='';
app.get('/acceptedrides', function(req, res) {
    paramname = req.param('paramname');
    paramvalue = req.param('paramvalue');
    arides_query = {
		type:"acceptedrides?limit=100", //Required - the type of collection to be retrieved
        qs: {"ql": paramname +"='" + paramvalue + "'"}
	};
	if(paramname === 'uuid'){
    	rides_query = {
    		"type":"acceptedrides",
            "uuid": paramvalue
    	};
	}
    if (loggedIn === null) {
      logIn(req, res, acceptedrides);
    } else {
      acceptedrides(req, res);
    }//qs:{ql:"name='bread' or uuid=b3aad0a4-f322-11e2-a9c1-999e12039f87"}
});


function acceptedrides(req, res) {
  loggedIn.createCollection(arides_query, function(err, rideshare) {
        if (err) {
          res.jsonp(500, {'error': JSON.stringify(err) });
          return;
        }
        var allrideshare = [];
        while (rideshare.hasNextEntity()) {
          var arideshare = rideshare.getNextEntity().get();
          allrideshare.push(arideshare);
        }
        res.jsonp(allrideshare);
    });
}


app.get('/cancelacceptedride', function(req, res) {
    var uuid = req.param('uuid');
    var auuid = req.param('auuid');
    var currentcount = req.param('currentcount');
    currentcount = +currentcount + 1;
    var maxcount = req.param('maxcount');
    var passenger_email = req.param('passenger_email');
        
	
    updateoptions = {
		"type": "wiprorideshares", //Required - the type of collection to be retrieved
        "uuid": uuid,
        "cuurentcount": currentcount
	};
	var acname = uuid + req.param('passenger_email');
	acceptoptions = {
        "uuid": auuid,
        "type": "acceptedrides"
	};
/*    if (loggedIn === null) {
      logIn(req, res, updatecount);
    } else {
      userid = req.param('userid');
      updatecount(req, res);
    }*///qs:{ql:"name='bread' or uuid=b3aad0a4-f322-11e2-a9c1-999e12039f87"}
    if (loggedIn === null) {
        logIn(req, res, function() {
            cancelRide(acceptoptions,updateoptions, req, res);
        });
    } else {
        cancelRide(acceptoptions,updateoptions, req, res);
    }
});
function cancelRide(e, updateoptions, req, res) {
    loggedIn.getEntity(e, function(err, o) {
        if (err) {
            res.jsonp(500, err);
            return;
        }
        o.set("status", "Cancelled");
        o.save(function(err) {
            if (err) {
 //             res.jsonp(500, err);
            res.send("Could not update status to cancelled")
              return;
            }
            var opts = {
                type: 'wiprorideshares',
//        name: 'Dominos' 
            };
            loggedIn.createEntity(opts, function(err, p) {
                if (err) {
                    res.jsonp(500, err);
                    return;
                }
                p.set(updateoptions);
                p.disconnect('accepted', o, function (err, data) {
                if (err) {
                    // error - connection not created
                } else {
                    if (loggedIn === null) {
                      logIn(req, res, function() {
                        updatecount(-1, req, res);
                     });
                    } else {
                      updatecount(-1,req, res);
                    }
                    
                    o.destroy(function(err){
                	if (err){
                		res.send("Could not delete acceptedrides object");
                	} else {
                		//success - user deleted from database
                		o = null; //blow away the local object
                		res.send("Successfully Cancelled.");
                	}
                });
                }
            });
        });
    });
    
    });
}
app.get('/createrideshare', function(req, res) {
   
    var b = req.body;
    var e = {
      'name': req.param('email'),
      'offeredby': req.param('offeredby'),
      'from_place': req.param('from_place'),
      'to_place': req.param('to_place'),
      'via': req.param('via'),
      'city': req.param('city'),
      'state': req.param('state'),
      'phone_number': req.param('phone_number'),
      'email': req.param('email'),
      'maxcount': req.param('maxcount'),
      'currentcount': '0',
      'status': 'active',
      'time': req.param('time'),
      'location': {	
		'latitude': req.param('latitude'),
		'longitude': req.param('longitude')  
      }};
      
    
    if (loggedIn === null) {
        logIn(req, res, function() {
            createrideshare(e, req, res);
        });
    } else {
        createrideshare(e, req, res);
    }
});

function createrideshare(e, req, res) {
    var opts = {
        type: 'wiprorideshares',
//        name: 'Dominos' 
    };
    loggedIn.createEntity(opts, function(err, o) {
        if (err) {
            res.jsonp(500, err);
            return;
        }
        o.set(e);
        o.save(function(err) {
            if (err) {
              res.jsonp(500, err);
              return;
            }
          
            res.send(201);
        });
    });
}
var geo_query = '';
app.get('/vicinityrideshare', function(req, res) {
  		var criteria = 'location within ' + req.param('radius') + ' of ' + req.param('latitude') + ', ' + req.param('longitude');
  		var count=100;
  		if (req.param('nearest') == '') {
          count=100;
  		}
  		else {
          count=req.param('nearest');
 		}
    	geo_query = {
		type:"wiprorideshares?limit=" + count, //Required - the type of collection to be retrieved
//		qs:criteria
//        qs: {"ql": "location within 500 of 51.5183638, -0.1712939000000233"}
          qs: {"ql": criteria}
	};
   
  if (loggedIn === null) {
      logIn(req, res, getridesharebylocation);
    } else {
//      userid = req.param('userid');
//      alert("Calling getridesharebylocation');
      getridesharebylocation(req, res);
    }
  	
});

function getridesharebylocation(req, res) {
  	
    loggedIn.createCollection(geo_query, function(err, rideshare) {     
        if (err) {
          res.jsonp(500, {'getridesharebylocation_error': JSON.stringify(err) });
          return;
        }
        
        var allrideshare = [];
        while (rideshare.hasNextEntity()) {
          var arow = rideshare.getNextEntity().get();
/*          var e = { 'ID': arow.uuid,
            		'name': arow.name,
                    'street': arow.street,
                    'address_line2': arow.address_line2,
                    'city': arow.city,
                   	'country': arow.country,
                   'phone': arow.phone,
                   'email': arow.email,
			'Roommate': arow.roommate,
			'Movie': arow.movie,
			'Travel': arow.travel,
			'Room': arow.room,
			'EatOut': arow.eatout,
			'Hiking': arow.hiking,
                   'Created': deal.created};*/
          allrideshare.push(arow);
        }
        res.jsonp(allrideshare);
    });
}


var login_query = '';


// We need this for UserGrid authentication

function logIn(req, res, next) {
    console.log('Logging in as %s', 'sujoyghosal');
    ug.login('sujoyghosal', 'Kolkata1', function(err) {
        if (err) {
          console.log('Login failed: %s', JSON.stringify(err));
          res.jsonp(500, {error: err});
          return;
        }
        
        loggedIn = new usergrid.client({
            'orgName' :  'sujoyghosal',
            'appName' :  'rideshare',
            'authType' : usergrid.AUTH_APP_USER,
            'token':     ug.token,
            logging:     true
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
