"use strict";

const configs = require('./config').getConfigs();
const logger = require('./logging').getLogger();

import GraphReport from './graph-report';
import schedule from 'node-schedule';
import { REPORTS, REPORTS_BY_PERIOD_ONLY, REPORTS_NO_FILTER, GRAGH_DIRS } from './constants';
import { getThreatAssessmentRequests, getUsers, getInsightsTrendingByUser, getInsightsSharedByUser, getInsightsUsedByUser, getMessages } from './graph-client';
import { delayLoop, getISOTodaysDateWithZeroTime, getISOCurrentDateTime, enrichListData, writeToUniqueFile, listFilesOlderThen, listEmptyDirectories, getISOPreviousDateByDay, deleteFile, saveReport, getPreviosDateByDays, getYesterdaysDate } from './util';

const main = function () {

    const run = _ => {
        logger.debug(`[main|run|in]`);
        logger.info(`[main] - appConfigs: (%o)`, configs.app);

        if (configs.services.graph.enableReports) {
            schedule.scheduleJob(configs.services.graph.reportsCronScheduler, _ => {

                Object.values(REPORTS).forEach(
                    delayLoop(reportType => {
                        new GraphReport()
                            .setReportType(reportType)
                            .filterByDate(getPreviosDateByDays(2)) // 2 days ago
                            .call((reportType, data) => { saveReport(configs.app.dataDirectoryPath, `${GRAGH_DIRS.REPORTS_BY_DATE}/${getPreviosDateByDays(2)}`, reportType, data) });
                    }, 60000)
                );

                Object.values(REPORTS).forEach(
                    delayLoop(reportType => {
                        new GraphReport()
                            .setReportType(reportType)
                            .filterByDate() // default to yesterday
                            .call((reportType, data) => { saveReport(configs.app.dataDirectoryPath, `${GRAGH_DIRS.REPORTS_BY_DATE}/${getYesterdaysDate()}`, reportType, data) });
                    }, 60000)
                );

                Object.values(REPORTS_BY_PERIOD_ONLY).forEach(
                    delayLoop(reportType => {
                        new GraphReport()
                            .setReportType(reportType)
                            .filterByPeriod()
                            .call((reportType, data) => { saveReport(configs.app.dataDirectoryPath, GRAGH_DIRS.REPORTS_BY_PERIOD, reportType, data) });
                    }, 60000)
                );

                Object.values(REPORTS_NO_FILTER).forEach(
                    delayLoop(reportType => {
                        new GraphReport()
                            .setReportType(reportType)
                            .call((reportType, data) => { saveReport(configs.app.dataDirectoryPath, GRAGH_DIRS.REPORTS, reportType, data) });
                    }, 60000)
                );

            });
        }

        let threatAssessmentCreatedTimestamp = undefined;
        if (configs.services.graph.enableThreatAssessmentRequests) {
            schedule.scheduleJob(configs.services.graph.threatAssessmentRequestsCronScheduler, _ => {
                threatAssessmentCreatedTimestamp ? _ : threatAssessmentCreatedTimestamp = getISOTodaysDateWithZeroTime();
                let results = [];
                const clientPromise = getThreatAssessmentRequests(threatAssessmentCreatedTimestamp, records => { results.push.apply(results, records) });
                clientPromise.then(_ => {
                    logger.debug(`ThreatAssessmentRequests: %o`, results);
                    if (results.length) writeToUniqueFile(configs.app.dataDirectoryPath, GRAGH_DIRS.THREAT_ASSESSMENT_REQUESTS, 'ThreatAssessmentRequests', results);
                });
                // so it start where it left off
                threatAssessmentCreatedTimestamp = getISOCurrentDateTime();
            });
        }


        if (configs.services.graph.enableInsights) {
            schedule.scheduleJob(configs.services.graph.insightsCronScheduler, _ => {
                let users = [];
                const usersPromise = getUsers(records => { users.push.apply(users, records) });
                usersPromise.then(_ => {
                    users.forEach((user) => {

                        let trendingResults = [];
                        const trendingPromise = getInsightsTrendingByUser(user, (user, records) => { trendingResults.push.apply(trendingResults, records) });
                        trendingPromise.then(_ => {
                            const enrichTrendingList = enrichListData(trendingResults, user, 'user');
                            logger.debug(`trending: %o`, enrichTrendingList);
                            if (enrichTrendingList.length) writeToUniqueFile(configs.app.dataDirectoryPath, GRAGH_DIRS.INSIGHTS, `Trending-${user.id}`, enrichTrendingList);
                        });

                        let usedResults = [];
                        const usedPromise = getInsightsUsedByUser(user, (user, records) => { usedResults.push.apply(usedResults, records) });
                        usedPromise.then(_ => {
                            const enrichUsedList = enrichListData(usedResults, user, 'user');
                            logger.debug(`used: %o`, enrichUsedList);
                            if (enrichUsedList.length) writeToUniqueFile(configs.app.dataDirectoryPath, GRAGH_DIRS.INSIGHTS, `Used-${user.id}`, enrichUsedList);
                        });

                        let sharedResults = [];
                        const sharedPromise = getInsightsSharedByUser(user, (user, records) => { sharedResults.push.apply(sharedResults, records) });
                        sharedPromise.then(_ => {
                            const enrichSharedList = enrichListData(sharedResults, user, 'user');
                            logger.debug(`shared: %o`, enrichSharedList);
                            if (enrichSharedList.length) writeToUniqueFile(configs.app.dataDirectoryPath, GRAGH_DIRS.INSIGHTS, `Shared-${user.id}`, enrichSharedList);
                        });
                    });
                });
            });
        }

        let mailRequestTimestamp = undefined;
        if (configs.services.graph.enableMail) {
            schedule.scheduleJob(configs.services.graph.mailCronScheduler, _ => {
                let users = [];
                const usersPromise = getUsers(records => { users.push.apply(users, records) });
                usersPromise.then(_ => {
                    mailRequestTimestamp ? _ : mailRequestTimestamp = getISOTodaysDateWithZeroTime();
                    users.forEach((user) => {
                        let mailResults = [];
                        const mailPromise = getMessages(user, mailRequestTimestamp, (user, timestamp, records) => { mailResults.push.apply(mailResults, records) });
                        mailPromise.then(_ => {
                            const enrichMailList = enrichListData(mailResults, user, 'user');
                            logger.debug(`emails: %o`, enrichMailList);
                            if (enrichMailList.length) writeToUniqueFile(configs.app.dataDirectoryPath, GRAGH_DIRS.EMAILS, `Messages-${user.id}`, enrichMailList);
                        });
                        // so it start where it left off
                        mailRequestTimestamp = getISOCurrentDateTime();
                    });
                });
            });
        }

        if (configs.app.enableDeleteFiles) {
            schedule.scheduleJob(configs.app.deleteFilesCronScheduler, _ => {
                let endTimestamp = new Date(getISOPreviousDateByDay(configs.app.deleteFilesDaysOld)).getTime();
                let files = listFilesOlderThen(configs.app.dataDirectoryPath, endTimestamp);
                let emptyDirectories = listEmptyDirectories(configs.app.dataDirectoryPath);
                logger.debug(`files: %o`, files);
                files.forEach(function (file) {
                    deleteFile(file);
                });
                emptyDirectories.forEach(function (directory) {
                    deleteFile(directory);
                });
            });
        }

        logger.debug(`[main|run|out]`);
    };

    return {
        run: run
    };

}();

module.exports = main;