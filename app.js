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
  usersDatasync.child(req.body.id).set(req.body);
  res.status(200).send({"success":true});
});

/**
 * Update user location
 */
app.post("/user/:id", function(req,res) {
  var user = usersDatasync.child(req.params.id);
  user.update({
    "lat": req.body.lat,
    "lng": req.body.lng
  });
  res.status(200).send({"success":true});

});


// Start the server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
});

// [END app]/*
