//import required modules
const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
let ptA = "";
let ptB = "";

dotenv.config();
const trakt = require("./modules/trakt/api");
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
//mongodb stuff
const { MongoClient } = require("mongodb");
const dbUrl = "mongodb://127.0.0.1:27017/howdb"; //default port is 27017
const client = new MongoClient(dbUrl);
var ObjectId = require('mongodb').ObjectId;

//set up Express app
const app = express();
const port = process.env.PORT || 8888;

//define important folders
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
//setup public folder
app.use(express.static(path.join(__dirname, "public")));
// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 

app.use(upload.array()); 
app.use(express.static('public'));

//PAGE ROUTES
/*
app.get("/", async (request, response) => {
  let movies = await trakt.getTrendingMovies();
  //console.log(movies);
  response.render("index", { title: "Movies", movieList: movies });
}); */
/*
app.get("/", async (request, response) => {
  let movies = await trakt.getRoute();
  //console.log(movies);
  response.render("route", { title: "Movies", movieList: movies });
}); */
/*
// Middleware function 1
const middleware1 = (req, res, next) => {
  let drivers = await getDrivers();
  //console.log('Middleware 1');
  next(); // Call next() to pass control to the next middleware
};
*/

app.get("/route", async (request, response) => {
  let drivers = await getDrivers();
    response.render("route", { title: "Rides", menu: drivers, fp: ptA, to: ptB });
 });
 app.get("/searchRide", async (request, response) => {
  let rides = await getRides();
    response.render("rides", { title: "Rides", menu: rides, fp: ptA, to: ptB });
 });
app.get("/routeInfo", async (request, response) => {
  //ptA = 'Clarendon Blvd,Arlington,VA';
  //ptB = '2400+S+Glebe+Rd,+Arlington,+VA';
  //ptA = 'Etobicoke,ON';
  //ptB = 'Indian Road,Toronto,ON';
  //for (let i = 0; i < driverList.length; i++) {
    let movies = await trakt.getRoutePoints(ptA,ptB);
    //drvDist[i] = movies.route.distance;
  //}
  
  //console.log(movies);
 // response.render("routeinfo", { title: "Movies", movieList: movies, pA: ptA, pB:ptB, drvList: driverList, dist:drvDist });
 response.render("routeinfo", { title: "Movies", movieList: movies, pA: ptA, pB:ptB});
});

app.get("/", (request, response) => {
  response.render("getpoints");
});
app.get("/addRideSuccess", (request, response) => {
  response.render("addedRide");
});

app.get("/about", (request, response) => {
  response.render("about");
});

app.get("/contact", (request, response) => {
  response.render("contact");
});
app.get("/postRide", (request, response) => {
  response.render("getridedet");
});
app.get("/aboutRide", async (request, response) => {
  let id = request.query.rideId;  
  let selRide = await getRideDet(id);
  ptA= selRide.from;
  ptB = selRide.to;
response.redirect("/routeInfo");
  
});

app.post("/postRide/submit", async (request, response) => {
  let rideID = request.body.rideID;
  let from = request.body.from;
  let to = request.body.to;
  let drvID = request.body.drvID;
  let usID = request.body.usID;
  let distance = request.body.distance;
  let cost = request.body.cost;
  var newRide = {"rideID": rideID, "from": from, "to": to, "driverID": drvID, "userID": usID, "distance": distance, "cost": cost};
  await addRide(newRide);
  response.redirect("/addRideSuccess"); 
});
/*
app.post("/", (request, response) => {
  //get form data
  let fromPt = request.body.from; //get the value for field with name="from"
  ptA = fromPt;
    //request.body is form POST data
  let toPt = request.body.to;
  ptB = toPt;
   response.render("router", {fp:fromPt, tp:toPt});
});
*/
app.get("/popular", async (request, response) => {
  let shows = await trakt.getPopularShows();
  //console.log(movies);
  response.render("popular", { title: "Movies", movieList: shows });
});
app.get("/ratings/:id", async (request, response) => {
  //console.log(request.params.id);
  let ratings = await trakt.getMovieRatings(request.params.id);
  let info = await trakt.getMovieSummary(request.params.id);
  response.render("ratings", { title: "Movie ratings", ratings: ratings, movieInfo: info });
});
/*
app.get("/", async (request, response) => {
  let shows = await trakt.getPopularShows();
  //console.log(movies);
  response.render("index", { title: "Movies", movieList: shows });
});
*/
//set up server listening
app.listen(port, () => {
  console.log(`Listening on http://localhost:${port}`);
});

async function connection() {
  await client.connect();
  db = client.db("howdb");
  return db;
  }
  async function getDrivers() {
  db = await connection();
  var results = db.collection("driverData").find({});
  res = await results.toArray();
  return res;
  }
  async function addRide(ride) {
    db = await connection();
    var status = await db.collection("rideData").insertOne(ride);
    console.log("ride added");
    }
  async function getRides() {
      db = await connection();
      var results = db.collection("rideData").find({});
      res = await results.toArray();
      return res;
      }
  async function getRideDet(id) {
    
        db = await connection();
        //const getRideId = { _id: new ObjectId(id) };
       //const getRideId = { _id: new MongoId(id) };
        //getRideId = "ObjectId(" + "\"" + id + "\"" +")"
       
      const query  = {"_id": new ObjectId(id)}
        const result = await db.collection("rideData").findOne(query);
        return result;
        }

