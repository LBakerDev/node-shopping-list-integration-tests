const chai = require('chai');
const chaiHttp = require('chai-http')

const{app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);


describe('Recipes', function() {

    before(function() {
        return runServer();
    });

    after(function() {
        return closeServer();
    });

    //test strategy:
    // 1. make request to 'recipes'
    // 2. inspect response object and prove code is correct

    it('should list items on GET', function() {
        //for Mocha test for async ops, we must
        //either return a Promise object or else call a 'done' callback
        //at the end of the test
        return chai.request(app)
          .get('/recipes')
          .then(function(res) {

              res.should.have.status(200);
              res.should.be.json;
              res.body.should.be.a('array');

              //because we create three items on app load
              res.body.length.should.be.at.least(1);
              // each item should be an object with key/value pairs
              // for `id`, `name`, `ingredients`.
              const expectedKeys = ['id', 'name', 'ingredients'];
              res.body.forEach(function(item) {
                  item.should.be.a('object');
                  item.should.include.keys(expectedKeys);
              })
          })
        });

        // test strategy:
        //  1. make a Post request with data for a new item
        //  2. inspect response object and prove its right
        //  status code and that the returned object has an 'id'

        it('should add a recipe on POST', function() {
            const newRecipe = {name: 'chocolate', ingredients: ['milk', 'chocolate']};
            return chai.request(app)
              .post('/recipes')
              .send(newRecipe)
              .then(function (res) {
                  res.should.have.status(201);
                  res.should.be.json;
                  res.body.should.be.a('object');
                  res.body.should.include.keys('id', 'name', 'ingredients');
                  res.body.id.should.equal(newRecipe.name);
                  res.body.ingredients.should.be.a('array');
                  // response should be deep equal to `newItem` from above if we assign
                  // `id` to it from `res.body.id`
                  res.body.ingredients.should.include.members(newRecipe.ingredients);
              });
        });

        // test strategy;
        //  1. initialize some update data
        //  2. make a GET request so we can get an item to update
        //  3. add the `id` to `updateData`
        //  4. Make a PUT request with `updateData`
        //  5. Inspect the response object to ensure it
        // has right status code and that we get back an updated
        // item with the right data in it.

        it('should update items on PUT', function() {

            const updateData = {
                name: 'chocolate',
                ingredients: ['milk', 'chocolate']
            };

            return chai.request(app)
            //first have to get so we have an idea of object to update
            .get('/recipes')
            .then(function(res) {
                updateData.id = res.body[0].id;
                //this will return a promise whose value will be the response
                //object
                return chai.request(app)
                    .put(`recipes/${updateData.id}`)
                    .send(updateData);
            })
            //prove that the PUT request has right status code
            // and returns updated item
            .then(function(res) {
                res.should.have.status(200);
                res.should.be.json;
                res.body.should.be.a('object');
                res.body.should.keys('id', 'name', 'ingredients');
                res.body.should.deep.equal(updateData.name);
                res.body.id.should.equal(updateData.id);
                res.body.ingredients.should.include.members(updateData.ingredients);
            });
        });

        it('should delete recipes on DELETE', function() {
            return chai.request(app)
            .get('/recipes')
            .then(function(res) {
                return chai.request(app)
                  .delete(`/recipes/${res.body[0].id}`)
            })
            .then(function(res) {
                res.should.have.status(204);
            });
        });
});