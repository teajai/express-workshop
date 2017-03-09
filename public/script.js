// Fetch is experimental
// https://developer.mozilla.org/en/docs/Web/API/Fetch_API
// So if using a browser not supporting fetch then get an alert to try
// another browser for this test

// if (typeof fetch !== "function") {
//   alert("Cannot handle fetch ");
// }

// Rewritten to use $.ajax rather than fetch
// Tested using various desktops and local network with mobile phones

// Called when document is ready
$(document).ready(function() {

  // Setup form so when submitted don't go down normal path but use this
  // process instead
  $("form").submit(function(event){
    //event.preventDefault(); Stops page being submitting - handled by false
    // return - see below
    postBlogItem(this); // this is the DOM object

    return false; // Return false stops page being submitted as per normal action
                  // submitting a form - don't need preventDefault as commented
                  // out above
                  // More explanation of the differences
                  // http://stackoverflow.com/questions/1357118/event-preventdefault-vs-return-false
  });

  // Now get the posts from the server to add to the bottom of the page
  // This gets all the posts returned
  $.ajax({
      url: '/get-posts',
      success: function(data) {
        addBlogpostsToPage (data);
      },
      error: function(error){
          console.log(error);
      }
  });
});


// The user has submitted an item now send the item to the server and get
// back an OK sign to then just add that item to the list at the bottom
// of the page
function postBlogItem (form) { // Passed DOM object of form
  var jform = $(form); // Now create JQuery object from DOM object
  // console.log(form); // Dom object
  // console.log("-----------------------------");
  // console.log(jform); // Jquery object
  // console.log(jform.serializeArray()); // Format {name:"blogpost", value="blah de blah"}
  // console.log("-----------------------------");
  // console.log(jform.serialize()); // Format 'blogpost=blah de blah'

  $.ajax({
      url: jform.attr("action"), // using JQuery obj or 'form.action' (DOM object)
      type: "POST",
      data: jform.serialize(), // Format 'blogpost=blah de blah'
      // OR instead of the above 'data' line can have the following 2 lines
      // data: jform.serializeArray(), // Format {name:"blogpost", value="blah de blah"}
      // dataType: 'json', // Need to indicate the format
      success: function(data) {
        addBlogpostsToPage (data);
        form.reset(); // Or 'jform[0].reset()' if wanting to use JQuery object
      },
      error: function(error){
          console.log(error);
      }
  });

}

// Add items in 'data' to the list of items at the bottom of the page
function addBlogpostsToPage (data) {
  for (var blogPost in data) {
    var postOuterDiv    = document.createElement('div');
    var postLink        = document.createElement('a');
    var postDiv         = document.createElement('div');
    var postText        = document.createElement('p');
    var thumbnail       = document.createElement('img');
    var postContainer   = document.getElementsByClassName('post-container')[0];

    thumbnail.src = "./img/logo2.png";
    thumbnail.className = "thumbnail";
    postText.innerHTML = data[blogPost];
    postDiv.className = "postInner"
    postLink.href = "/posts/" + blogPost.toString();
    postOuterDiv.className = "post";

    postDiv.appendChild(thumbnail);
    postDiv.appendChild(postText);
    postLink.appendChild(postDiv)
    postOuterDiv.appendChild(postLink)
    postContainer.appendChild(postOuterDiv);
  }
}
