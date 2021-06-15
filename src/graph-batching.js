"use strict";

const logger = require('./logging').getLogger();
import HttpMethodsEnum from 'http-methods-enum';
import { GEAPH_API, GEAPH_API_VERSION, GEAPH_API_BATCH_NAME_SPACE } from './constants';

exports.makeBatchRequest = async (accessToken, batchRequestBody) => {
    logger.debug(`[graph-batching|makeBatchRequest|in]`);
    const batchRequestConfig = {
        method: HttpMethodsEnum.POST,
        url: `${GEAPH_API}${GEAPH_API_VERSION}${GEAPH_API_BATCH_NAME_SPACE}`,
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: batchRequestBody
    }
    try {
        const response = await axios(batchRequestConfig)
        console.log(response.data);
    } catch (error) {
        if (error.response) {
            logger.error('status: (%o)', error.response.status);
            logger.error('data: (%o)', error.response.data);
            logger.error('headers: (%o)', error.response.headers);
        }
    }

};