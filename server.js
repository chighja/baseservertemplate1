'use strict';

const express = require('express');
const mongoose = require('mongoose');
const { DATABASE_URL, PORT } = require('./config');
const { Base } = require('./model');

const app = express();
app.use(express.json());

// connect to database/check for connection error
mongoose.connect(
  'mongodb://localhost:27017/baseServerDb',
  { useNewUrlParser: true }
);
const db = mongoose.connection;

db.once('open', function() {
  console.log('Connected to database');
}).on('error', function(error) {
  console.log('Connection error:', error);
});

// GET
app.get('/base', (req, res) => {
  return Base.find()
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went wrong' });
    });
});

// GET by id
app.get('/base/:id', (req, res) => {
  return Base.findById(req.params.id)
    .then(data => {
      res.json(data);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went wrong' });
    });
});

// POST
app.post('/base', (req, res) => {
  const requiredFields = ['name', 'comment'];
  for (let i = 0; i < requiredFields; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing ${field} in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  let myComment = new Base(req.body);
  myComment
    .save()
    .then(item => {
      res.send('item saved to database');
    })
    .catch(err => {
      res.status(400).send('unable to save to database');
    });
});

// PUT -Update chosen fields
app.put('/base/:id', (req, res) => {
  let updated = {};
  let updateableFields = ['name', 'comment'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
    Base.findByIdAndUpdate(req.params.id, { $set: updated }, { new: true })
      .then(() => {
        res
          .status(204)
          .json({ message: `updated item with id ${req.params.id}` })
          .end();
      })
      .catch(err => res.status(500).json({ error: 'something went wrong' }));
  });
});

// DELETE by id
app.delete('/base/:id', (req, res) => {
  return Base.findByIdAndRemove(req.params.id)
    .then(() => {
      res
        .status(204)
        .json({ message: `deleted item with id ${req.params.id}` })
        .end();
    })
    .catch(err => res.status(500).json({ error: 'something went wrong' }));
});

// open and close the server
let server;

function runServer(databaseURL, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(
      databaseURL,
      err => {
        if (err) {
          return reject(err);
        }
        server = app
          .listen(port, () => {
            console.log(`Your app is listening on port ${port}`);
            resolve();
          })
          .on('error', err => {
            mongoose.disconnect();
            reject(err);
          });
      }
    );
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

app.listen(process.env.PORT || 5005);

module.exports = { runServer, app, closeServer };
