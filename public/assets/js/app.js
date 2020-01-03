//On button click, take user to /articles/:id page
$(".submit").on("click", function () {
    var thisId = $(this).attr("data-id");
    // post request to database
    res.redirect("/articles/" + thisId);
});


// Grab the articles as a json
$.getJSON("/articles", function (data) {
    // For each one
    for (var i = 0; i < data.length; i++) {
        // Display the apropos information on the page
        $("#articles").append("<li data-id='" + data[i]._id + "'><strong>Headline: </strong>" + data[i].headline + 
        "</li><li><strong>Summary: </strong>" + data[i].summary + 
        "</li><li><strong>URL: </strong><a href='https://www.dailymail.co.uk" + data[i].url + "'>https://www.dailymail.co.uk" + data[i].url + 
        "</li><li><a href='/../../../views/comment'>Comment" + "</li><br />" + "<br />");
    }
});

// Whenever someone clicks a li tag
$(document).on("click", "li", function () {
    // Empty the comments from the comment section
    $("#comments").empty();
    // Save the id from the li tag
    var thisId = $(this).attr("data-id");

    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        // With that done, add the comment information to the page
        .then(function (data) {
            console.log(data);
            // The title of the article
            $("#comments").append("<h2>" + data.title + "</h2>");
            // An input to enter a new title
            $("#comments").append("<input id='titleinput' name='title' >");
            // A textarea to add a new comment body
            $("#comments").append("<textarea id='bodyinput' name='body'></textarea>");
            // A button to submit a new comment, with the id of the article saved to it
            $("#commentss").append("<button data-id='" + data._id + "' id='savecomment'>Save Comment</button>");

            // If there's a comment in the article
            if (data.comment) {
                // Place the comment in the text input
                $("#textinput").val(data.comment.text);
            }
        });
});

// When you click the savecomment button
$(document).on("click", "#savecomment", function() {
    // Grab the id associated with the article from the submit button
    var thisId = $(this).attr("data-id");

    // Run a POST request to change the comment, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            // Value taken from text input
            text: $("#textinput").val()
        }
    })
    // With that done
    .then(function (data) {
        // Log the response
        console.log(data);
        // Empty the comments section
        $("#comments").empty();
    });

    // Also, remove the values entered in the input and textarea for comment entry
    $("#textinput").val("");
});