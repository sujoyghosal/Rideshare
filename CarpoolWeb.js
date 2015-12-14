var express = require("express");
var app     = express();
var path    = require("path");

app.use(express.static('www'));
app.get('/',function(req,res){
  res.sendFile(path.join(__dirname + '/www/GetRide.html'));
  //__dirname : It will resolve to your project folder.
});

app.get('/createRide',function(req,res){
  res.sendFile(path.join(__dirname+'/www/OfferARide.html'));
});

app.get('/acceptedrides',function(req,res){
  res.sendFile(path.join(__dirname+'/www/MyAcceptedRides.html'));
})

app.get('/offeredrides',function(req,res){
  res.sendFile(path.join(__dirname+'/www/MyOfferedRides.html'));
})

app.get('/myoffers',function(req,res){
  res.sendFile(path.join(__dirname+'/www/MyOffers.html'));
})
app.listen(8000);
console.log('Server is listening to http://localhost/ on port 8000');