// 3_extension-individual-blog-posts using mustache-individual blog posts
const TEST = true;
const BASE_DIR = __dirname ;
const FILENAME = BASE_DIR + '/data/posts.json';
const INDEX_FILE = BASE_DIR + '/public/index.html';
const TEST_FILE = BASE_DIR + '/public/test-post-and-get.html';
const POST_FILE = BASE_DIR + '/views';

// request a weekday along with a long date
const DISPLAY_DATE_OPTIONS = { weekday: 'long', year: 'numeric',
                              month: 'long', day: 'numeric',
                              hour:'numeric', minute:'numeric'};

// Require express
var express = require('express');
var formidable = require('express-formidable');
var fetch = require('node-fetch');
// Module used for views/templates in node
var mustacheExpress = require('mustache-express');

// File that stores data
var fs = require('fs');

// Initialise server
var app = express();

/*
Get warning "(node:13132) MaxListenersExceededWarning: Possible EventEmitter
memory leak detected. 11 field listeners added. Use emitter.setMaxListeners()
to increase limit"
THe following was added to try to stop this problem.
*/
require('events').EventEmitter.prototype._maxListeners = 100;

// Get files from the public folder
app.use(express.static("public"));

// use the new module express-formidable
app.use(formidable());

// Register '.mustache' extension with The Mustache Express - folder 'views'
app.engine('mustache', mustacheExpress());
// Using template engines with Express
// http://expressjs.com/en/guide/using-template-engines.html
app.set('view engine', 'mustache');
app.set('views', POST_FILE );

function testLog( thingy ) {
  if ( TEST ) {
    console.log(thingy);
  }
}

function addItemToFIle(key, data, res) {
  fs.readFile(FILENAME, function (error, file) {

      //testLog(file.toString());
      var parsedFile = JSON.parse(file);
      // testLog(parsedFile);

      parsedFile[key] = data;
      //testLog(parsedFile);

      //testLog(JSON.stringify(parsedFile, null, '\t') );

      fs.writeFile(FILENAME,
            JSON.stringify(parsedFile, null, '\t'), (err) => {
        if (err) throw err;
        testLog('It\'s saved!');
      });

  });

}

function addItemToFIleAndSendJSON(submittedData, res) {
  var blogpost = submittedData['blogpost'];
  testLog(blogpost);
  var dateTime = Date.now().toString();
  testLog("now[" + dateTime.toString() + "]");

  addItemToFIle( dateTime, blogpost, res );

  // testLog(now);

  res.setHeader('Content-Type', 'application/json');
  // res.send(JSON.stringify({dateTime : blogpost })); sends "dateTime" as key
  res.send(JSON.stringify(new function(){ this[dateTime] = blogpost; },
                            null, '\t'));


}

function addItemToFIleTEST(submittedData, res) {
  var blogpost = submittedData['blogpost'];
  //testLog(blogpost);
  var now = Date.now().toString();

  addItemToFIle( now, blogpost, res );

  // testLog(now);
  res.sendFile(TEST_FILE);

}

function sendBlogPage(res, blogId, blogindex, jsonData) {
    var dateHeader = "No blog found";
    var postText = ""
    var visPrev = "hidden";
    var visNext = "hidden";
    var idPrev = 0;
    var idNext = 0;

    if ( blogId !== null ) {
      dateHeader = new Date(Number(blogId)).
                    toLocaleDateString("en",DISPLAY_DATE_OPTIONS);
      // testLog(dateHeader);
      postText = jsonData[blogId];

      // testLog("FOUND");
      // testLog(Object.keys(jsonData)[0]);
      // testLog(Object.keys(jsonData)[(Object.keys(jsonData).length)-1]);
      if ( blogId !== Object.keys(jsonData)[0] ) {
        visPrev = "visible";
        idPrev = Object.keys(jsonData)[blogindex-1];
      }
      if ( blogId !== Object.keys(jsonData)[(Object.keys(jsonData).length)-1] ){
        visNext = "visible";
        idNext = Object.keys(jsonData)[blogindex+1];
      }
    }

    res.render('post', { title:     "Post item",
                          date:     dateHeader,
                          post:     postText,
                          id:       blogId,
                          visPrev:  visPrev,
                          idPrev:   idPrev,
                          visNext:  visNext,
                          idNext:   idNext });
}

app.get('/create-post', function (req, res) {
    testLog("GET T");
    testLog(req.query); // fields for get only
    addItemToFIleAndSendJSON(req.query,res);
    // testLog('Got the GET data');
});

app.post('/create-post', function (req, res) {
    testLog("POST T");
    testLog(req.query); // nothing for Post
    testLog(req.fields);
    addItemToFIleAndSendJSON(req.fields,res);
    // testLog('Got the POST data');
});

app.get('/get-posts', function (req, res) {
    // testLog("GET /get-posts Tania");
    // testLog(req.url);
    //testLog(req.query); // fields for get only
    // addItemToFIle(req.query,res);
    // testLog('Got the GET data');
    res.sendFile(FILENAME)

});

app.post('/get-posts', function (req, res) {
    //testLog("POST /get-posts");
    res.sendFile(FILENAME)
});

app.get("/test", function (req, res) {
  res.sendFile(TEST_FILE);
});

app.get('/create-test-post', function (req, res) {
    //testLog("\nGET TEST T");
    //testLog(req.query); // fields for get only
    testLog("req.body[" + req.body + "]"); // this is still undefined with express-formidable
    //testLog(req.fields); // req.fields are only available in a POST request
    testLog("req.url[" + req.url + "]");
    addItemToFIleTEST(req.query,res);
    //testLog('Got the GET data');
});

app.post('/create-test-post', function (req, res) {
    testLog("\nPOST TEST T");
    //testLog(req);
    testLog("req.body[" + req.body + "]"); // this is still undefined with express-formidable
    testLog(req.fields); // data with POST
    //testLog("req.url[" + req.url + "]");
    addItemToFIleTEST(req.fields,res);
    //testLog('Got the POST data');
});

// Code for 3_extension-individual-blog-posts
// app.get('/posts/:postId', function (req, res) { - :postId indicates a flexible endpoint
app.get('/posts/:postId', function (req, res) {
    // testLog(req.params.postId.toString());

    fs.readFile(FILENAME, 'utf8', function (err, filedata) {
        if (err) throw err; // we'll not consider error handling for now
        var jsonData = JSON.parse(filedata);
        // testLog("jsonData length[" + Object.keys(jsonData).length + "]");
        // testLog(jsonData);
        // testLog(jsonData[1]);

        var blogId = null;
        var idx = 0;
        for (var blogPost in jsonData) {
          // testLog("blogPost[" + blogPost.toString() +
          //             "] blogPostDate[" + new Date(Number(blogPost)).toLocaleDateString() +
          //             "] jsonData[blogPost]["+ jsonData[blogPost] +
          //             "]");

          if ( req.params.postId === blogPost ) {
            blogId = blogPost;
            break;
          }
          idx++;
        }

        sendBlogPage(res, blogId, idx, jsonData);

    });


});


/* old code
// Handle a request function - this is to handle http://ip:port/ requests
app.get("/", function (req, res) {
  res.send("Changing text");
});

// Handle a request function - this is to handle http://ip:port/coffee requests
app.get("/coffee", function (req, res) {
  res.send("Black or white?");
});

// Handle a request function - this is to handle http://ip:port/node requests
app.get("/node", function (req, res) {
  res.send("BYep you got node");
});

// Handle a request function - this is to handle http://ip:port/girls requests
app.get("/girls", function (req, res) {
  res.send("You mean women right?");
});
*/
/*
app.post('/*', function (req, res) {
  testLog("* POST");
  res.send("POST error");
});

app.get('/*', function (req, res) {
  testLog("* GET");
  res.send("GET error");
});
*/


// Start listening
app.listen(3000, function () {
  console.log('Server is listening on port 3000. Ready to accept requests!');
});
