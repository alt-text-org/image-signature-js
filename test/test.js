/* global describe, it */

'use strict'

const assert = require('assert')
const _ = require('underscore')
const nj = require('numjs')

const imageSignature = require('../lib/image_signature')

describe('imageSignature', function () {
  describe('#generate()', function () {
    it('return signature for small jpg image', function () {
      const img = addAlphas(nj.images.read(__dirname + '/fixtures/istanbul_small.jpg'))
      const imageData = {
        height: img.shape[0],
        width: img.shape[1],
        data: img.flatten().tolist()
      }
      const signature = imageSignature.generate(imageData)
      signature.forEach(comparisonGroup => assert(comparisonGroup.length <= 8))
      assert.strictEqual(signature.length, 81)
    })
    it('distance between small and medium should be little', function () {
      const small = addAlphas(nj.images.read(__dirname + '/fixtures/istanbul_small.jpg'))
      const medium = addAlphas(nj.images.read(__dirname + '/fixtures/istanbul_medium.jpg'))
      
      const imageDataSmall = {
        height: small.shape[0],
        width: small.shape[1],
        data: small.flatten().tolist()
      }
      const imageDataMedium = {
        height: medium.shape[0],
        width: medium.shape[1],
        data: medium.flatten().tolist()
      }
      const signatureSmall = imageSignature.generate(imageDataSmall)
      this.timeout(20000)
      const signatureMedium = imageSignature.generate(imageDataMedium)
      const distance = imageSignature.distance(signatureSmall, signatureMedium)
      assert(distance < 0.4)
    })
    it('distance between different images should be large', function () {
      this.timeout(5000)
      const istanbul = addAlphas(nj.images.read(__dirname + '/fixtures/istanbul_medium.jpg'))
      const spaceship = addAlphas(nj.images.read(__dirname + '/fixtures/spaceship.jpg'))
      
      const imageDataIstanbul = {
        height: istanbul.shape[0],
        width: istanbul.shape[1],
        data: istanbul.flatten().tolist()
      }
      const imageDataSpaceship = {
        height: spaceship.shape[0],
        width: spaceship.shape[1],
        data: spaceship.flatten().tolist()
      }
      const signatureIstanbul = imageSignature.generate(imageDataIstanbul)
      const signatureSpaceship = imageSignature.generate(imageDataSpaceship)
      const distance = imageSignature.distance(signatureIstanbul, signatureSpaceship)
      assert(distance > 0.4)
    })
  })
  describe('#autoCrop()', function () {
    it('should not return a list with the element', function () {
      const data = nj.multiply(nj.random([100, 150]), 255)
      const image = nj.array(data.flatten().tolist().map(el => Math.floor(el))).reshape([100, 150])
      const cropped = imageSignature.autoCrop(image, 10, 90) 
      // should be about 90 in height
      assert(Math.abs(cropped.shape[0] - 80) < 7)
      // should be about 120 in width
      assert(Math.abs(cropped.shape[1] - 120) < 10)
    })
  })
  describe('#normalize()', function () {
    it('should return -2 for much darker', function () {
      const result = imageSignature.normalize(2, 50, -50, -72)
      assert.strictEqual(result, -2)
    })
    it('should return -1 for darker', function () {
      const result = imageSignature.normalize(2, 50, -50, -23)
      assert.strictEqual(result, -1)
    })
    it('should return 0 for same', function () {
      const result = imageSignature.normalize(2, 50, -50, 1)
      assert.strictEqual(result, 0)
    })
    it('should return 1 for lighter', function () {
      const result = imageSignature.normalize(2, 50, -50, 13)
      assert.strictEqual(result, 1)
    })
    it('should return 2 for much lighter', function () {
      const result = imageSignature.normalize(2, 50, -50, 64)
      assert.strictEqual(result, 2)
    })
  })
  describe('#computeGridAverages()', function () {
    it('should return the correct average for the top right corner ', function () {
      const image = nj.arange(1, 101).reshape(10,10)
      const neighborGroups = imageSignature.computeGridAverages(image, 10, 10)
      // square should be [1, 2, 11, 12]
      const expected = (12 + 13 + 22 + 23) / 4
      const result = neighborGroups.get(0,0)
      assert.strictEqual(result, expected)
    })
    it('should return the correct square for the middle', function () {
      const image = nj.arange(1, 101).reshape(10,10)
      const neighborGroups = imageSignature.computeGridAverages(image, 10, 10)
      // square should be [56, 57, 66, 67]
      const expected = (56 + 57 + 66 + 67) / 4
      const result = neighborGroups.get(4, 4)
      assert.strictEqual(result, expected)
    })
    it('should return the correct square for the bottom right corner', function () {
      const image = nj.arange(1, 101).reshape(10,10)
      const neighborGroups = imageSignature.computeGridAverages(image, 10, 10)
      // square should be [89, 90, 99, 100]
      const expected = 100
      const result = neighborGroups.get(8, 8)
      assert.strictEqual(result, expected)
    })
  })
  describe('#distance()', function () {
    it('should return the correct distance between two signatures', function () {
      const s1 = [[2, 3], [1, 1], [1]] // ||s1|| = 4
      const s2 = [[4, 2], [1, 2], [1]] // ||s2|| = sqrt(26)
      const distance = imageSignature.distance(s1, s2)
      const expected = Math.sqrt(4 + 1 + 0 + 1 + 0) / (4 + Math.sqrt(26))
      assert.strictEqual(distance, expected)
    })
  })
})

function addAlphas(img) {
  const zeros = nj.zeros([img.shape[0], img.shape[1], 1])
  return nj.concatenate(img, zeros)
}
