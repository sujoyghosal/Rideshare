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
    'clientSecret': 'YXA6Ia6ex7xPsJK7hrhLky5ZvP03CbQ',
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
    var paramname = req.param('paramname');
    var paramvalue = req.param('paramvalue');
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
var group_query = '';
app.get('/getusersingroup', function(req, res) {
    var group = req.param('group');
    
    group_query = {
		method: 'GET',
        endpoint: 'groups/' + group + '/users/'
	};
	
    if (loggedIn === null) {
      logIn(req, res, getusersingroup);
    } else {
      getusersingroup(req, res);
    }//qs:{ql:"name='bread' or uuid=b3aad0a4-f322-11e2-a9c1-999e12039f87"}
});


function getusersingroup(req, res) {
  loggedIn.request(group_query, function (err, users) {
        if (err) {
            res.send("ERROR");
        } else {
            res.send(users.entities);
        }
    });
}

var gcmids_query = '';
var gcmid = '';
app.get('/attachgcmidtouser', function(req, res) {
    gcmid = req.param('gcmid');
    var uuid = req.param('uuid');
    
    gcmids_query = {
        type: 'user',
        uuid: req.param('uuid')
    };
	
    if (loggedIn === null) {
      logIn(req, res, attachgcmidtouser);
    } else {
      attachgcmidtouser(req, res);
    }//qs:{ql:"name='bread' or uuid=b3aad0a4-f322-11e2-a9c1-999e12039f87"}
});


function attachgcmidtouser(req, res) {
   
  loggedIn.getEntity(gcmids_query, function (err, entity) {
        if (err) {
            res.send("ERROR");
        } else {
          //  res.send(entity);
            var gcm_ids = [];
            if("gcm_ids" in entity._data)
                gcm_ids = entity._data.gcm_ids;
//            res.send(gcm_ids);
//            return;
            if(gcm_ids.indexOf(gcmid) > -1){
                res.send("SUCCESS");
                return;
            }
            gcm_ids.push(gcmid);
            entity.set('gcm_ids', gcm_ids);
            entity.save(function (err) {
            if (err) {
                res.jsonp(500, "ERROR");
                return;
            }
            res.send(gcm_ids);
        });
        }
    });
}

var detach_query='';
app.get('/detachgcmidsfromuser', function(req, res) {
    
    detach_query = {
        type: 'user',
        uuid: req.param('uuid')
    };
	
    if (loggedIn === null) {
      logIn(req, res, detachgcmidsfromuser);
    } else {
      detachgcmidsfromuser(req, res);
    }//qs:{ql:"name='bread' or uuid=b3aad0a4-f322-11e2-a9c1-999e12039f87"}
});


function detachgcmidsfromuser(req, res) {
   
  loggedIn.getEntity(detach_query, function (err, entity) {
        if (err) {
            res.send("ERROR");
        } else {
          //  res.send(entity);
            var gcm_ids = [];
            entity.set('gcm_ids', gcm_ids);
            entity.save(function (err) {
            if (err) {
                res.jsonp(500, "ERROR");
                return;
            }
            res.send("SUCCESS " + gcm_ids);
        });
        }
    });
}
app.get('/updateusersettings', function(req, res) {
    if (loggedIn === null) {
      logIn(req, res, updateusersettings);
    } else {
      updateusersettings(req, res);
    }//qs:{ql:"name='bread' or uuid=b3aad0a4-f322-11e2-a9c1-999e12039f87"}
});


function updateusersettings(req, res) {
   
   var option = {
       "type": "users",
       "uuid": req.param('uuid')
   }
  loggedIn.getEntity(option, function (err, entity) {
        if (err) {
            res.send("ERROR");
        } else {
          //  res.send(entity);
            var settings = {
                'pushon':req.param('pushon'),
                'pushstarttime':req.param('starttime'),
                'pushstoptime':req.param('stoptime'),
            };
            entity.set('settings', settings);
            entity.save(function (err) {
            if (err) {
                res.jsonp(500, "ERROR");
                return;
            }
            res.send(entity);
        });
        }
    });
}
var uuid='';
var currentcount='';
var maxcount='';
var updateoptions='';
var passenger={};
var acceptoptions='';

app.get('/acceptride', function(req, res) {
    uuid = req.param('uuid');
    currentcount = req.param('currentcount');
    currentcount = +currentcount + 1;
    maxcount = req.param('maxcount');
    passenger = {
	    "passenger_name": req.param('passenger_name'),
        "passenger_phone": req.param('passenger_phone'),
        "passenger_email": req.param('passenger_email'),
        "passenger_uuid": req.param('passenger_uuid')
	};
    updateoptions = {
        "cuurentcount": currentcount,
        "passengers": passenger,
        "status": "Accepted"
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
        //    acceptRide(acceptoptions,updateoptions, req, res);
        acceptride(1, uuid, req, res);
        });
    } else {
        //acceptRide(acceptoptions,updateoptions, req, res);
        acceptride(1, uuid, req, res);
    }
});


function acceptride(incr,uuid, req, res) {
  var opt =  {
		"type": "wiprorideshares", //Required - the type of collection to be retrieved
        "uuid": uuid
  };
   
  loggedIn.getEntity(opt, function(err, rideshare) {
//    loggedIn.createCollection(options, function(err, ngccnotifications) {
//  loggedIn.request({ options, function(err, ngccnotifications) {      
        if (err) {
          res.jsonp(500, {'error': JSON.stringify(err) });
          return;
        }
        
//        res.send(rideshare._data.passengers.length);
//        return;
        if(!rideshare._data.passengers || rideshare._data.passengers.length === 0){
            var p = [];
            p.push(passenger);
            rideshare.set('passengers',p);
        } else {
              for (var i=0; i < rideshare._data.passengers.length; i++) {
              var apasseneger = rideshare._data.passengers[i];
              if(apasseneger.passenger_email === passenger.passenger_email){
                  res.send("Already Accepted");
                  return;
              }
            }
            rideshare._data.passengers.push(passenger);
        }
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

var arides_query='';
app.get('/acceptedrides', function(req, res) {
    var email = req.param('email');
    
    if (loggedIn === null) {
        logIn(req, res, function() {
            acceptedrides(email, req, res);
        });
    } else {
        acceptedrides(email, req, res);
    }
});


function acceptedrides(email, req, res) {
  var opt = {
      "type": "wiprorideshares",
      qs: {"ql": "status='active'"}
  };
  loggedIn.createCollection(opt, function(err, rideshare) {
        if (err) {
          res.jsonp(500, {'error': JSON.stringify(err) });
          return;
        }
//        res.jsonp(rideshare._list[0]._data.passengers);
//        return;
        var accepted_rides = [];
        if(!rideshare._list || rideshare._list.length === 0){
            res.send("You Have No Accepted Rides.");
            return;
        } else {
                for (var i=0; i < rideshare._list.length; i++) {
                    if(rideshare._list[i]._data.passengers && rideshare._list[i]._data.passengers.length > 0){
                        for (var j=0; j < rideshare._list[i]._data.passengers.length; j++) {
                            if(rideshare._list[i]._data.passengers[j].passenger_email === email){
                              accepted_rides.push(rideshare._list[i]);
                            } 
                        }
                    }
                }
            }
        if(accepted_rides && accepted_rides.length > 0)
            res.send(accepted_rides);
        else
            res.send("You Have No Accepted Rides.");
    });
}
var arides_query='';
app.get('/getpassengersforride', function(req, res) {
    var uuid = req.param('uuid');
    
    if (loggedIn === null) {
        logIn(req, res, function() {
            getpassengersforride(uuid, req, res);
        });
    } else {
        getpassengersforride(uuid, req, res);
    }
});


function getpassengersforride(uuid, req, res) {
    var query = {
        type: 'wiprorideshares',
        uuid: uuid
    };
    loggedIn.getEntity(query, function (err, entity) {
        if (err) {
            res.send("ERROR");
        } else {
            res.send(entity._data.passengers);
            return;
        }
        });
};

var arides_query='';
app.get('/getuserbyuuid', function(req, res) {
    var uuid = req.param('uuid');
    
    if (loggedIn === null) {
        logIn(req, res, function() {
            getuserbyuuid(uuid, req, res);
        });
    } else {
        getuserbyuuid(uuid, req, res);
    }
});


function getuserbyuuid(uuid, req, res) {
    var query = {
        type: 'user',
        uuid: uuid
    };
    loggedIn.getEntity(query, function (err, entity) {
        if (err) {
            res.send("ERROR");
        } else {
            res.send(entity._data);
            return;
        }
        });
};



app.get('/canceloffer', function(req, res) {
    var uuid = req.param('uuid');
    
    if (loggedIn === null) {
        logIn(req, res, function() {
            canceloffer(uuid, req, res);
        });
    } else {
        canceloffer(uuid, req, res);
    }
});


function canceloffer(uuid, req, res) {
  var opt = {
      "type": "wiprorideshares",
      "uuid": uuid
  };
  loggedIn.getEntity(opt, function(err, o) {
        if (err) {
          res.jsonp(500, {'error': JSON.stringify(err) });
          return;
        }
        o.destroy(function(err){
        	if (err){
        		res.send("Could not cancel offer");
        	} else {
        		//success - user deleted from database
        		o = null; //blow away the local object
        		res.send("Successfully Cancelled Offered Ride.");
        	}
        });
    });
}


app.get('/cancelacceptedride', function(req, res) {
    var uuid = req.param('uuid');
//    var auuid = req.param('auuid');
    var currentcount = req.param('currentcount');
    currentcount = +currentcount + 1;
    var maxcount = req.param('maxcount');
    var passenger_email = req.param('passenger_email');
        
	
    updateoptions = {
		"type": "wiprorideshares", //Required - the type of collection to be retrieved
        "uuid": uuid,
	};
	
    if (loggedIn === null) {
        logIn(req, res, function() {
            cancelRide(passenger_email,updateoptions, req, res);
        });
    } else {
        cancelRide(passenger_email,updateoptions, req, res);
    }
});
function cancelRide(e, updateoptions, req, res) {
    loggedIn.getEntity(updateoptions, function(err, o) {
        if (err) {
            res.jsonp(500, err);
            return;
        }
        for(var i = o._data.passengers.length - 1; i >= 0; i--) {
            if(o._data.passengers[i].passenger_email === e) {
                o._data.passengers.splice(i, 1);
            }
        }
        var cc = o._data.currentcount;
            cc = +cc - 1;
            if(+cc > 0)
                o.set('currentcount',cc);
            else {
                o.set('currentcount',0);
            }
            
            o.save(function(err) {
            if (err) {
 //             res.jsonp(500, err);
                res.send("Could not update status to cancelled")
              return;
            } else {
                res.jsonp(o);
            }
            
        });
    });
}

app.get('/createrideshare', function(req, res) {
   
    var b = req.body;
    var name = req.param('email') + '-' + req.param('time');
    var e = {
      'name': name,
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
      'vehicle_type': req.param('vehicle_type'),
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
            res.send(err);
            return;
        }
        o.set(e);
        o.save(function(err) {
            if (err) {
              res.send(err);
              return;
            }
          
            res.send("OFFER CREATED");
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
app.get('/creategroup', function (req, res) {

    var group = req.param('group');

    var options = {
        method: 'POST',
        endpoint: 'groups',
        body: {
            path: group,
            name: group
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

app.get('/createuser', function (req, res) {

    var fullname = req.param('fullname');
    var password = req.param('password');
    var email = req.param('email');
    var dept = req.param('dept');
    var phone = req.param('phone');

    var options = {
        method: 'POST',
        endpoint: 'users',
        body: {
            username: email,
            name: email,
            email: email,
            fullname: fullname,
            password: password,
            phone: phone,
            dept: dept
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
            res.send("ERROR");
        } else {
            res.send("CREATED");
        }
    });
}


app.get('/getuser', function (req, res) {
    var email = req.param('email');
    var options2 = {
        type: "users",
        qs: {
            "ql": "name='" + email + "'"
        }
    };
    if (loggedIn === null) {
        logIn(req, res, function () {
            getuserbyemail(options2, req, res);
        });
    } else {
        getuserbyemail(options2, req, res);
    }//qs:{ql:"name='bread' or uuid=b3aad0a4-f322-11e2-a9c1-999e12039f87"}
});


//Call request to initiate the API call

function getuserbyemail(e, req, res) {

    loggedIn.createCollection(e, function (err, users) {
        if (err) {
            res.jsonp(e);
            return;
        }

        var allusers = [];
        while (users.hasNextEntity()) {
            var auser = users.getNextEntity().get();
            allusers.push(auser);
        }
        if(allusers.length > 0)
        res.jsonp(allusers);
        else
            res.send("User Not Found");
    });
}

var login_query = '';


// We need this for UserGrid authentication

function logIn(req, res, next) {
    console.log('Logging in as %s', 'sujoyghosal');
    ug.login('sujoyghosal', 'Kolkata41', function(err) {
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
