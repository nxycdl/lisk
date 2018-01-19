/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 */
'use strict';

var Promise = require('bluebird');

var swaggerEndpoint = require('../../../common/swaggerSpec');
var modulesLoader = require('../../../common/modulesLoader');
var waitFor = require('../../../common/utils/waitFor');
var onNewRoundPromise = Promise.promisify(waitFor.newRound);

describe('cached endpoints', function () {

	var cache;
	var getJsonForKeyPromise;

	before(function (done) {
		__testContext.config.cacheEnabled = true;
		modulesLoader.initCache(function (err, __cache) {
			cache = __cache;
			getJsonForKeyPromise = Promise.promisify(cache.getJsonForKey);
			expect(err).to.not.exist;
			expect(__cache).to.be.an('object');
			return done(err);
		});
	});

	after(function (done) {
		cache.quit(done);
	});

	afterEach(function (done) {
		cache.flushDb(function (err, status) {
			expect(err).to.not.exist;
			expect(status).to.equal('OK');
			done(err);
		});
	});

	describe('GET /delegates', function () {

		var delegatesEndpoint = new swaggerEndpoint('GET /delegates');
		var params = {
			username: 'genesis_90'
		};
		var urlPath;

		it('should flush cache on the next round @slow', function () {
			return delegatesEndpoint.makeRequest(params, 200).then(function (res) {
				urlPath = res.req.path;
				// Check key in cache after, 0, 10, 100 ms, and if value exists in any of this time period we respond with success
				return Promise.all([0, 10, 100].map(function (delay) {
					return Promise.delay(delay).then(function () {
						return getJsonForKeyPromise(res.req.path);
					});
				})).then(function (responses) {
					responses.should.deep.include(res.body);
					return onNewRoundPromise().then(function () {
						return getJsonForKeyPromise(urlPath).then(function (result) {
							expect(result).to.not.exist;
						});
					});
				});
			});
		});
	});
});