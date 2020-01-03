// Dependencies
var express = require("express");
var logger = require("morgan");
var mongojs = require("mongojs");
var mongoose = require('mongoose');
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Use morgan logger for logging requests
app.use(logger("dev"));

// Use the express.static middleware to serve static content for the app from the "public" directory in the application directory.
app.use(express.static("public"));

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsdb";

mongoose.connect(MONGODB_URI);

// Database configuration
var databaseUrl = "newsdb";
var collections = ["scrapedNews", "comments"];

// Hook mongojs configuration to the db variable
// var db = mongojs(databaseUrl, collections);
var db = require("./models");
// db.on("error", function(error) {
//   console.log("Database Error:", error);
// });

// Retrieve data from the db
app.get("/", function(req, res) {
  // Find all results from the scrapedNews collection in the db
  db.Articles.find({})
  .then(function(data) {
    // If any articles are found, send them to the client
    res.render("index", {articles: data});
  })
  .catch(function(err) {
    res.json(err);
  });
});


app.get("/scrape", function(req, res) {
  // Make a request via axios for the news section of `ycombinator`
  axios.get("https://www.dailymail.co.uk/ushome/index.html").then(function(response) {
    // Load the html body from axios into cheerio
    var $ = cheerio.load(response.data);
    // For each element with a "article" class
    $("div.article").each(function(i, element) {
      var headline = $(element)
        .children("h2").text().trim();
      var summary = $(element)
        .children("div.articletext")
        .children("p").text().trim();
      var url = $(element)
        .children("h2")
        .children("a").attr("href");
      
        console.log(headline);
        console.log(summary);
        console.log(url);
      // If this found element had a headline, summary, and url
      if (headline && summary && url) {
        // Insert the data in the scrapedNews db
        db.Articles.create({
          headline: headline,
          summary: summary,
          url: url
        },
        function(err, created) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(created);
          }
        });
      }
    });
  });

  // Send a "Scrape Complete" message to the browser
  // res.redirect("/");
  
  res.send("Return to /articles to view articles")
});


// Route for getting all Questions from the db
app.get("/articles", function (req, res) {
  // Grab every document in the Questions collection
  db.Articles.find({})
  .then(function(articlesdb) {
    res.json(articlesdb);
  })
  .catch(function(err) {
    res.json(err);
  });
});

// generic form for creating comment under each article, associated iwth article ID
// when submitted display under article

// Show the user the individual comment and the form to update the comment.
app.get("/Articles/:id", function(req, res) {
  var articleId = req.params.id;
  db.Articles.find({_id: articleId}), function(err, found) {
    if (err) {
      console.log(err)
    } else {
      res.render("comment", found);
    }
  }
});

app.post("/Articles/:id", function(req,res) {
  db.Articles.create(req.body)
  .then(function(commentsdb) {
    return db.Articles.findOneAndUpdate({
      _id: req.params.id
    }, {
      comment: commentsdb._id
    }, {
      new: true
    });
  }).then(function (articlesdb) {
    res.json(articlesdb);
  }).catch(function (err) {
    res.json(err);
  });
});


// Listen on port 3000
app.listen(PORT, function() {
  console.log("Listening on port: " + PORT);
});

