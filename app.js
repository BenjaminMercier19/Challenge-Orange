/**
 * Copyright 2016, Google, Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// [START app]
'use strict';

const express = require('express');
const Webcom = require('webcom');
const app = express();
var bodyParser = require('body-parser');

var hackathon = new Webcom('https://io.datasync.orange.com/base/hackathon');
var usersDatasync = new Webcom('https://io.datasync.orange.com/base/hackathon/users');
var areasDatasync = new Webcom('https://io.datasync.orange.com/base/hackathon/areas');


app.use('/scripts', express.static('node_modules'));
app.use(express.static('app'));
// parse application/json
app.use(bodyParser.json())



app.get('/', (req, res) => {
    /*res.status(200).send('Hello, world!');*/
    res.sendFile(__dirname +'/app/index.html');
});

app.get('/write', (req, res) => {
    myRef.set({foo: 'bar'});
    res.status(200).send('Hello, world!');
});

/**
 * Create user
 */
app.post("/user", function(req, res) {
  //process.stdout.write("creating user");
  //process.stdout.write(req.body.id);

  usersDatasync.child(req.body.id).set(req.body);
  res.status(200).send({"success":true});
});

/**
 * Update user location
 */
app.post("/user/:id", function(req,res) {
  //process.stdout.write("updating user");
  //process.stdout.write(req.params.id);

  var user = usersDatasync.child(req.params.id);
  user.update({
    "lat": req.body.lat,
    "lng": req.body.lng
  });
  res.status(200).send({"success":true});

});

/**
 * Get user info in zone
 */
app.post("/user/:id/:beaconID", function (req, res) {
  var user = usersDatasync.child(req.params.id);
  var areas = areasDatasync.on("value", function(snapArea){
    var area = snapArea.val();
    if(area.metadata.beaconID == req.params.beaconID)
    {
      //Get area security_level
      if(area.metadata.security_level == 1)
      {

      }

    }
  })
});

function sendMessageToPops(message)
{
  // Build the post string from an object
  var post_data = querystring.stringify({
      'compilation_level' : 'ADVANCED_OPTIMIZATIONS',
      'output_format': 'json',
      'output_info': 'compiled_code',
        'warning_level' : 'QUIET',
        'js_code' : codestring
  });

  // An object of options to indicate where to post to
  var post_options = {
      host: 'closure-compiler.appspot.com',
      port: '80',
      path: '/compile',
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response: ' + chunk);
      });
  });

  // post the data
  post_req.write(post_data);
  post_req.end();

}


// Start the server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});

// [END app]/*
