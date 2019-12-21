// Dependencies
var express = require("express");
var mongojs = require("mongojs");
var mongoose = require('mongoose');
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");
// var exphbs = require("express-handlebars");

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/newsdb";

mongoose.connect(MONGODB_URI);


// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "newsdb";
var collections = ["scrapedNews"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello world");
});

// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedNews collection in the db
  db.scrapedNews.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
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
      var headline = $(element).children("img").attr("alt");
      var summary = $(element).children("p").text();
      var url = $(element).children("a").attr("href");
      console.log(headline);
      console.log(summary);
      console.log(url);

      // If this found element had a headline, summary, and url
      if (summary && url) {
        // Insert the data in the scrapedNews db
        db.scrapedNews.insert({
          // headline: headline,
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
          }
        });
      }
    });
  });

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});

