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

var _ = require('lodash');

// Private Fields
var modules;

/**
 * @class
 * @requires lodash
 * @param {Object} scope - App instance.
 * @todo: add description of DappsController
 */
function DappsController (scope) {
	modules = scope.modules;
}

/**
 * @public
 * @param {Object} context
 * @param {function} next
 * @todo: add description of the function and its parameters
 */
DappsController.getDapps = function (context, next) {
	var params = context.request.swagger.params;

	var filters = {
		transactionId: params.transactionId.value,
		name: params.name.value,
		sort: params.sort.value,
		limit: params.limit.value,
		offset: params.offset.value
	};

	// Remove filters with null values
	filters = _.pickBy(filters, function (v) {
		return !(v === undefined || v === null);
	});

	modules.dapps.shared.getDapps(_.clone(filters), function (err, data) {
		try {
			if (err) { return next(err); }

			data = _.cloneDeep(data);

			data = _.map(data, function (dapp) {
				if (_.isNull(dapp.description)) {
					dapp.description = '';
				}
				if (_.isNull(dapp.tags)) {
					dapp.tags = '';
				}
				if (_.isNull(dapp.icon)) {
					dapp.icon = '';
				}
				return dapp;
			});

			next(null, {
				data: data,
				meta: {
					offset: filters.offset,
					limit: filters.limit
				}
			});

		} catch (error) {
			next(error);
		}
	});
};

module.exports = DappsController;
