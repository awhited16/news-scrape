// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var mongoose = require('mongoose');
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");

// Initialize Express
var app = express();

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
var collections = ["scrapedNews"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
// app.get("/", function(req, res) {
//   res.send("Hello world");
// });

// Retrieve data from the db
app.get("/", function(req, res) {
  // Find all results from the scrapedNews collection in the db
  db.scrapedNews.find({})
  .then(function(err, doc) {
    // If any articles are found, send them to the client
    // res.json(newsdb);
    res.render("index", {article: doc});
  })
  .catch(function(err) {
    // If an error occurs, send it back to the client
    res.json(err);
  });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
  // Make a request via axios for the news section of `ycombinator`
  axios.get("https://www.dailymail.co.uk/news/index.html").then(function(response) {
    // Load the html body from axios into cheerio
    var $ = cheerio.load(response.data);
    // For each element with a "article" class
    $("div.articletext").each(function(i, element) {
      // Save the headline, summary, and url of each link enclosed in the current element
      // The Onion
      // var headline = $(element).text();
      // var summary = $(element).children("p").text();
      // var url = $(element).parent("a").attr("href");

      // Daily Mail - all but headline
      var headline = $(element).children("a").children("img").attr("alt");
      var summary = $(element).children("p").text();
      var url = $(element).children("a").attr("href");
      console.log(headline);
      console.log(summary);
      console.log(url);

      // If this found element had a headline, summary, and url
      if (headline && summary && url) {
        // Insert the data in the scrapedNews db
        db.scrapedNews.insert({
          headline: headline,
          summary: summary,
          url: url
        },
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(inserted);
            res.send("Return to homepage to view articles")
          }
        });
      }
    });
  });

  // Send a "Scrape Complete" message to the browser
  // res.redirect("/");
});

// Show the user the individual quote and the form to update the quote.
app.get("/:id", function(req, res) {
  var articleId = req.params.id;
  db.scrapedNews.find({_id: articleId})
  .then(function(newsdb) {
    // If any Books are found, send them to the client
    res.json(newsdb);
  })
  .catch(function(err) {
    // If an error occurs, send it back to the client
    res.json(err);
  });
});

app.post("/:id", function(req,res) {
  db.Comment.create(req.body)
  .then(function(commentdb) {
    return db.scrapedNews.findOneAndUpdate({
      _id: req.params.id
    }, {
      comment: commentdb._id
    }, {
      new: true
    });
  }).then(function (newsdb) {
    res.json(newsdb);
  }).catch(function (err) {
    res.json(err);
  });
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});

