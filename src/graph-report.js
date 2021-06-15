"use strict";

const graphAuth = require('./graph-auth');
const logger = require('./logging').getLogger();
import axios from 'axios';
import HttpMethodsEnum from 'http-methods-enum';
import HttpStatus from 'http-status-codes';
import { GEAPH_API, GEAPH_API_VERSION, GEAPH_API_REPORTS_NAME_SPACE, REPORTS_PERIOD, REPORTS_FILTER } from './constants';
import { getYesterdaysDate } from './util';

const reportUrl = `${GEAPH_API}${GEAPH_API_VERSION}${GEAPH_API_REPORTS_NAME_SPACE}`

module.exports = class GraphReport {

  constructor() {
    this.reportType = undefined
    this.reportFilterType = undefined
    this.reportFilterValue = undefined
    this.apiData = undefined
  }

  get urlValue() {
    logger.debug(`[GraphReport|urlValue|in]`);
    const filter = _populateFilter(this.reportFilterType, this.reportFilterValue);
    return `/${GEAPH_API_REPORTS_NAME_SPACE}${this.reportType}${filter}`
  }

  setReportType(reportType) {
    logger.debug(`[GraphReport|setReportType|in] - (%o)`, reportType);
    this.reportType = reportType
    return this;
  }

  filterByDate(reportFilterValue = getYesterdaysDate()) {
    logger.debug(`[GraphReport|filterByDate|in] - (%o)`, reportFilterValue);
    this.reportFilterType = REPORTS_FILTER.BY_DATE
    this.reportFilterValue = reportFilterValue
    return this;
  }

  filterByPeriod(reportFilterValue = REPORTS_PERIOD.D7) {
    logger.debug(`[GraphReport|filterByPeriod|in] - (%o)`, reportFilterValue);
    this.reportFilterType = REPORTS_FILTER.BY_PERIOD
    this.reportFilterValue = reportFilterValue
    return this;
  }

  async call(callback) {
    logger.debug(`[GraphReport|call|in]`);
    const filter = _populateFilter(this.reportFilterType, this.reportFilterValue);
    const reportRequestConfig = {
      method: HttpMethodsEnum.GET,
      url: `${reportUrl}${this.reportType}${filter}`,
      headers: { 'Authorization': `Bearer ${graphAuth.getAccessToken()}` }
    }
    try {
      const response = await axios(reportRequestConfig)
      this.apiData = response.data;
      logger.debug(this.reportType);
      callback(this.reportType, this.apiData);
    } catch (error) {
      if (error.response) {
        logger.error('Report Type: (%o)', this.reportType);
        logger.error('status: (%o)', error.response.status);
        logger.error('data: (%o)', error.response.data);
        logger.error('headers: (%o)', error.response.headers);
        if (error.response.status == HttpStatus.UNAUTHORIZED) {
          logger.error(`[ Reports.Read.All permission is required to call this API ]`);
        }
      }
    }
  }

};

const _populateFilter = (reportFilterType, reportFilterValue) => {
  if (typeof reportFilterType === 'undefined' || typeof reportFilterValue === 'undefined') {
    return '';
  }
  return `(${reportFilterType}=${reportFilterValue})`;
}