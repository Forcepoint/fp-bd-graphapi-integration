"use strict";

const logger = require('./logging').getLogger();
import axios from 'axios';
import HttpMethodsEnum from 'http-methods-enum';
import qs from 'qs';

const graphAuth = function () {

	let initiated = false;
	let graphApiToken;
	let renewTokenIn = 0;

	const _verify = _ => {
		if (!initiated)
			throw new Error('!!! graphAuth module not initiated !!!');
	};

	const init = (graphServiceConfig, entrypoint) => {

		logger.debug(`[graphAuth|init|in] - graphServiceConfig: (%o)`, graphServiceConfig);
		if (!initiated) {

			const apiConfig = {
				method: HttpMethodsEnum.POST,
				url: `https://login.microsoftonline.com/${graphServiceConfig.tenantId}/oauth2/v2.0/token`,
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
				data:
					qs.stringify({
						client_id: graphServiceConfig.clientId,
						scope: 'https://graph.microsoft.com/.default',
						client_secret: graphServiceConfig.clientSecret,
						grant_type: 'client_credentials'
					})
			}

			try {
				let timerId = setTimeout(function _renewAccessToken() {
					const promise = _populateAccessToken(apiConfig, entrypoint);
					promise.then(_ => {
						entrypoint = _ => { return ""; };
						timerId = setTimeout(_renewAccessToken, renewTokenIn);
					});
				}, renewTokenIn);
			} catch (e) {
				logger.error(e);
				clearTimeout(timerId);
			}

			initiated = true;
		}
		logger.debug(`[graphAuth|init|out]`);
	};

	const getAccessToken = _ => {
		_verify();
		return graphApiToken;
	};

	const _populateAccessToken = async (apiConfig, entrypoint) => {

		logger.debug(`[graphAuth|_populateAccessToken|in] - apiConfig: (%o)`, apiConfig);
		try {
			const response = await axios(apiConfig);
			const graphTokenExpiresIn = response.data.expires_in;
			graphApiToken = response.data.access_token
			renewTokenIn = (graphTokenExpiresIn - 60) * 1000
			entrypoint();
		} catch (e) {
			if (e.response.data) {
				logger.error(`[graph-auth] - (%o)`, e.response.data);
				logger.error('clientSecret, clientid or tenantId provided is wrong or it could be due to clientSecret is expired, check the error above');
				process.abort();
			} else {
				logger.error(`[graph-auth] - (%o)`, e);
			}
		}
		logger.debug(`[graphAuth|_populateAccessToken|out]`);
	}

	return {
		init: init
		, getAccessToken: getAccessToken
	};

}();

module.exports = graphAuth;