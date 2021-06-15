"use strict";

const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');
const logger = require('./logging').getLogger();

import axios from 'axios';
import graphAuth from './graph-auth';
import HttpMethodsEnum from 'http-methods-enum';
import HttpStatus from 'http-status-codes';

exports.getUsers = async callback => {
  logger.debug(`[graph-client|getUsers|in]`);
  const client = _getAuthenticatedClient(graphAuth.getAccessToken());
  try {
    const res = await client.api('/users')
      .select('displayName,id,userType')
      .get();
    const records = await _handlePagination(res);
    callback(records);
  } catch (error) {
    _handleGraphApiErrors(error, 'getUsers', 'User.Read.All');
  }
};

exports.getInsightsTrendingByUser = async (user, callback) => {
  logger.debug(`[graph-client|getInsightsTrendingByUser|in]`);
  const client = _getAuthenticatedClient(graphAuth.getAccessToken());
  try {
    const res = await client.api(`/users/${user.id}/insights/trending`)
      .get();
    const records = await _handlePagination(res);
    callback(user, records);
  } catch (error) {
    _handleGraphApiErrors(error, 'getInsightsTrendingByUser', 'Sites.Read.All', user);
  }
};

exports.getInsightsSharedByUser = async (user, callback) => {
  logger.debug(`[graph-client|getInsightsSharedByUser|in]`);
  const client = _getAuthenticatedClient(graphAuth.getAccessToken());
  try {
    const res = await client.api(`/users/${user.id}/insights/shared`)
      .get();
    const records = await _handlePagination(res);
    callback(user, records);
  } catch (error) {
    _handleGraphApiErrors(error, 'getInsightsSharedByUser', 'Sites.Read.All', user);
  }
};

exports.getInsightsUsedByUser = async (user, callback) => {
  logger.debug(`[graph-client|getInsightsUsedByUser|in]`);
  const client = _getAuthenticatedClient(graphAuth.getAccessToken());
  try {
    const res = await client.api(`/users/${user.id}/insights/used`)
      .get();
    const records = await _handlePagination(res);
    callback(user, records);
  } catch (error) {
    _handleGraphApiErrors(error, 'getInsightsUsedByUser', 'Sites.Read.All', user);
  }
};

exports.getThreatAssessmentRequests = async (createdTimestamp, callback) => {
  logger.debug(`[graph-client|getThreatAssessmentRequests|in]`);
  const client = _getAuthenticatedClient(graphAuth.getAccessToken());
  try {
    const res = await client
      .api('/informationProtection/threatAssessmentRequests')
      .filter(`createdDateTime gt ${createdTimestamp}`)
      .get();
    const records = await _handlePagination(res);
    callback(records);
  } catch (error) {
    _handleGraphApiErrors(error, 'getThreatAssessmentRequests', 'ThreatAssessment.Read.All');
  }
};

exports.getMessages = async (user, timestamp, callback) => {
  logger.debug(`[graph-client|getMessages|in]`);
  const client = _getAuthenticatedClient(graphAuth.getAccessToken());
  try {
    const res = await client.api(`/users/${user.id}/messages`)
      .filter(`createdDateTime gt ${timestamp} or lastModifiedDateTime gt ${timestamp} or lastModifiedDateTime gt ${timestamp} or sentDateTime gt ${timestamp}`)
      .get();
    const records = await _handlePagination(res);
    callback(user, timestamp, records);
  } catch (error) {
    _handleGraphApiErrors(error, 'getMessages', 'Mail.Read', user);
  }
};

exports.getSubscribedSkus = async (callback) => {
  logger.debug(`[graph-client|getSubscribedSkus|in]`);
  const client = _getAuthenticatedClient(graphAuth.getAccessToken());
  try {
    const res = await client.api(`/subscribedSkus`)
      .get();
    const records = await _handlePagination(res);
    callback(records);
  } catch (error) {
    _handleGraphApiErrors(error, 'getSubscribedSkus', 'Directory.Read.All');
  }
};

exports.getOwnedObjects = async (user, callback) => {
  logger.debug(`[graph-client|getOwnedObjects|in]`);
  const client = _getAuthenticatedClient(graphAuth.getAccessToken());
  try {
    const res = await client.api(`/users/${user.id}/ownedObjects`)
      .get();
    const records = await _handlePagination(res);
    callback(user, records);
  } catch (error) {
    _handleGraphApiErrors(error, 'getOwnedObjects', 'Directory.Read.All', user);
  }
};

exports.getOwnedDevices = async (user, callback) => {
  logger.debug(`[graph-client|getOwnedDevices|in]`);
  const client = _getAuthenticatedClient(graphAuth.getAccessToken());
  try {
    const res = await client.api(`/users/${user.id}/ownedDevices`)
      .get();
    const records = await _handlePagination(res);
    callback(user, records);
  } catch (error) {
    _handleGraphApiErrors(error, 'getOwnedDevices', 'Directory.Read.All', user);
  }
};

exports.getRegisteredDevices = async (user, callback) => {
  logger.debug(`[graph-client|getRegisteredDevices|in]`);
  const client = _getAuthenticatedClient(graphAuth.getAccessToken());
  try {
    const res = await client.api(`/users/${user.id}/registeredDevices`)
      .get();
    const records = await _handlePagination(res);
    callback(user, records);
  } catch (error) {
    _handleGraphApiErrors(error, 'getRegisteredDevices', 'Directory.Read.All', user);
  }
};

const _handleGraphApiErrors = (error, origin, requiredPermission, user = '') => {
  switch (error.statusCode) {
    case HttpStatus.UNAUTHORIZED:
    case HttpStatus.FORBIDDEN:
      logger.error(`${requiredPermission} permission is required to call this API ]`);
      break;
    case HttpStatus.NOT_FOUND:
      logger.warn(`[graph-client|${origin}] - Error Code: (%o)`, error.code);
      logger.warn(`[graph-client|${origin}] - Error Message: (%o)`, error.message);
      logger.warn(`This might be due to Office365 plan is not assigned to the user, or the user is a guest user: - (%o)`, user);
      break;
    default:
      logger.error(`[graph-client|${origin}] - (%o)`, error);
  }
}

const _handlePagination = async res => {
  let records = res.value;
  let keepGoing = true;
  let nextLink = res['@odata.nextLink'];
  if (nextLink) {
    while (keepGoing) {
      let paginationResponse = await _makePaginationCall(nextLink);
      await records.push.apply(records, paginationResponse.value);
      logger.debug('records length: (%o)', records.length);
      paginationResponse['@odata.nextLink'] ? nextLink = paginationResponse['@odata.nextLink'] : keepGoing = false
    }
  }
  return records;
}

const _makePaginationCall = async nextLink => {
  logger.debug(`[graph-client|_makePaginationCall|in]`);
  const callConfig = {
    method: HttpMethodsEnum.GET,
    url: nextLink,
    headers: { 'Authorization': `Bearer ${graphAuth.getAccessToken()}` }
  }
  try {
    const response = await axios(callConfig);
    return response.data;
  } catch (error) {
    if (error.response) {
      logger.error(`[graph-client|_makePaginationCall] - (%o)`, error.response);
    }
  }
}

const _getAuthenticatedClient = accessToken => {
  // Initialize Graph client
  const client = graph.Client.init({
    // Use the provided access token to authenticate requests
    authProvider: (done) => {
      done(null, accessToken);
    }
  });

  return client;
};