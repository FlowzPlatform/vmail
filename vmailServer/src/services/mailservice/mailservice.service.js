// Initializes the `mailservice` service on path `/mailservice`
const createService = require('feathers-rethinkdb');
const hooks = require('./mailservice.hooks');
const filters = require('./mailservice.filters');

module.exports = function () {
  const app = this;
  const Model = app.get('rethinkdbClient');
  const paginate = app.get('paginate');

  const options = {
    name: 'emailIds',
    Model,
    paginate
  };

  // Initialize our service with any options it requires
  app.use('/mailservice', createService(options));

  // Get our initialized service so that we can register hooks and filters
  const service = app.service('mailservice');

  service.hooks(hooks);

  if (service.filter) {
    service.filter(filters);
  }
};
