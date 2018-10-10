'use strict';

const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');

const { Base } = require('./model');
const { runServer, app, closeServer } = require('./server.js');
const { TEST_DATABASE_URL } = require('./config');

chai.use(chaiHttp);

// generate mock data for test-database
function seedBaseData() {
  console.info('seeding base data');
  const seedData = [];
  for (let i = 1; i <= 10; i++) {
    seedData.push(generateBaseData());
  }
  return Base.insertMany(seedData);
}

function generateName() {
  let randomName = faker.name.findName();
  let names = [];
  for (let i = 0; i < 5; i++) {
    names.push(randomName);
  }
  return names[Math.floor(Math.random() * names.length)];
}

function generateComment() {
  let randomComment = faker.lorem.sentences();
  let comments = [];
  for (let i = 0; i < 5; i++) {
    comments.push(randomComment);
  }
  return comments[Math.floor(Math.random() * comments.length)];
}

function generateBaseData() {
  return {
    name: generateName(),
    comment: generateComment()
  };
}

// remove test-database
function tearDownDb() {
  console.warn('deleting database');
  return mongoose.connection.dropDatabase();
}

// database 'open server, create database, remove database, close server' process
describe('Base data resource', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  beforeEach(function() {
    return seedBaseData();
  });
  afterEach(function() {
    return tearDownDb();
  });
  after(function() {
    return closeServer();
  });

  // GET test
  describe('GET', function() {
    it('should get all existing comments', function() {
      return chai
        .request(app)
        .get('/base')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res.body).to.have.lengthOf.at.least(1);
        });
    });

    it('should get comments with correct fields', function() {
      let resBase;
      return chai
        .request(app)
        .get('/base')
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.lengthOf.at.least(1);
          res.body.forEach(base => {
            expect(base).to.be.a('object');
            expect(base).to.include.keys('_id', 'name', 'comment');
          });
          resBase = res.body[0];
          console.log(resBase._id);
          return Base.findById(resBase._id);
        })
        .then(base => {
          expect(resBase.name).to.equal(base.name);
          expect(resBase.comment).to.equal(base.comment);
        });
    });
  });

  // POST test
  describe('POST', function() {
    it('should post a new comment', function(done) {
      const newBase = generateBaseData();

      return chai
        .request(app)
        .post('/base')
        .send(newBase)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys('name', 'comment');
          expect(res.body.id).to.have.lengthOf.at.least(1);
          expect(res.body.name).to.equal(newBlog.name);
          expect(res.body.comment).to.equal(newBlog.comment);
          return Base.findById(res.body.id);
        })
        .then(base => {
          expect(base.name).to.equal(newBase.name);
          expect(base.comment).to.equal(newBase.comment);
        })
        .then(done())
        .catch(err => err);
    });
  });

  // PUT test
  describe('PUT', function() {
    it('should update sent fields', function() {
      const updateBase = {
        name: faker.name.findName(),
        comment: faker.lorem.sentences()
      };
      return Base.findOne()
        .then(base => {
          updateBase.id = base.id;
          return chai
            .request(app)
            .put(`/base/${base.id}`)
            .send(updateBase);
        })
        .then(res => {
          expect(res).to.have.status(204);
          return Base.findById(updateBase.id);
        })
        .then(base => {
          expect(base.name).to.equal(updateBase.name);
          expect(base.comment).to.equal(updateBase.comment);
        });
    });
  });

  // DELETE test
  describe('DELETE', function() {
    it('should delete a comment by id', function() {
      let base;
      return Base.findOne()
        .then(_base => {
          base = _base;
          return chai.request(app).delete(`/base/${base.id}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          return Base.findById(base.id);
        })
        .then(_base => expect(_base).to.be.null);
    });
  });
});
