const assert = require('assert');
const app = require('../../src/app');

describe('\'mailservice\' service', () => {
  it('registered the service', () => {
    const service = app.service('mailservice');

    assert.ok(service, 'Registered the service');
  });
});
