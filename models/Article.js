var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new LibrarySchema object
// This is similar to a Sequelize model
var ArticleSchema = new Schema({
  Headline: {
    type: String,
    required: true
  },
  Summary: {
    type: String,
    required: true
  },
  URL: {
    type: String,
    required: true
  },
  Comments: [{
      type: Schema.Types.ObjectId,
      ref: "Comment"
  }]
});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Book model
module.exports = Article;
