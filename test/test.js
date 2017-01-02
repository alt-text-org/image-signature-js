'use strict';

const assert = require('assert');

const imageSignature = require('../');

describe('imageSignature', function() {
  describe('#indexOf()', function() {
    it('should return -1 when the value is not present', function() {
      assert.equal(-1, [1,2,3].indexOf(4));
    });
  });
});
