const TEST = false;
const BASE_DIR = __dirname ;
const FILENAME = BASE_DIR + '/data/posts.json';
const INDEX_FILE = BASE_DIR + '/public/index.html';
const TEST_FILE = BASE_DIR + '/public/test-post-and-get.html';

//Require express
var express = require('express');
var formidable = require('express-formidable');
var fetch = require('node-fetch');

// File that stores data
var fs = require('fs');

// Initialise server
var app = express();

// Get files from the public folder
app.use(express.static("public"));

// use the new module express-formidable
app.use(formidable());

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
  var now = Date.now().toString();

  addItemToFIle( now, blogpost, res );

  // testLog(now);

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify({now : blogpost }));

}

function addItemToFIleTEST(submittedData, res) {
  var blogpost = submittedData['blogpost'];
  //testLog(blogpost);
  var now = Date.now().toString();

  addItemToFIle( now, blogpost, res );

  // testLog(now);
  res.sendFile(TEST_FILE);

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
