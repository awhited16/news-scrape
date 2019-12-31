var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new LibrarySchema object
// This is similar to a Sequelize model
var ArticlesSchema = new Schema({
  headline: {
    type: String,
    required: false
  },
  summary: {
    type: String,
    required: false
  },
  url: {
    type: String,
    required: false
  },
  Comments: [{
      type: Schema.Types.ObjectId,
      ref: "Comment"
  }]
});

// This creates our model from the above schema, using mongoose's model method
var Articles = mongoose.model("Articles", ArticlesSchema);

// Export the Book model
module.exports = Articles;
