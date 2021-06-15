"use strict";

const path = require('path');
const fs = require('fs');
import { CONF_DIR, GRAPH_SERVICE_REQUIRED_CONFIGS_LST, GRAGH_DIRS } from './constants';
require('dotenv').config();

global.__basedir = path.resolve(__dirname, '..');
const dataDirectoryPath = `${__basedir}/${GRAGH_DIRS.DATA}`;
fs.mkdir(dataDirectoryPath, { recursive: true }, (err) => {
    if (err) console.error(`[config|mkdir] ${dataDirectoryPath} - (%o)`, err);
});

const appConfigsDefault = {
    name: 'fp-ms-graph-api-integration',
    enableDeleteFiles: true,
    deleteFilesCronScheduler: '0 0 1 * *', // run every 00:00 on day-of-month 1
    deleteFilesDaysOld: 30,
    dataDirectoryPath: dataDirectoryPath
}

const graphServiceConfigsDefault = {
    tenantId: undefined,
    clientId: undefined,
    clientSecret: undefined,
    enableReports: true,
    reportsCronScheduler: '0 0 * * *', // run everyday at midnight
    enableThreatAssessmentRequests: true,
    threatAssessmentRequestsCronScheduler: '0 * * * *', // run every hour
    enableInsights: true,
    insightsCronScheduler: '0 * * * *', // run every hour
    enableMail: true,
    mailCronScheduler: '0 * * * *' // run every hour
}

const logConfigsDefault = {
    dir: `${__basedir}/${GRAGH_DIRS.LOGS}`,
    level: 'info',
    fileName: 'trace.log',
    fileSize: 1048576,
    fileNum: 5,
    console: false
}

const safeGuardConfigsCheck = (obj, requiredFieldsList) => {
    requiredFieldsList.forEach(function (value) {
        if (typeof obj[value] === 'undefined' || obj[value] === null || obj[value] === '') {
            console.error(`${value} configuration is required.`);
            process.exit();
        }
    });
};

const config = function () {

    let initiated = false;
    let configs;

    const verify = _ => {
        if (!initiated)
            init();
    };

    const init = (configDir = CONF_DIR) => {
        if (!initiated) {
            let fileConfigs = require('node-config-yaml').load(configDir);

            const appConfigs = { ...appConfigsDefault, ...fileConfigs.app };

            const app = {
                name: process.env.APP_NAME || appConfigs.name
                , enableDeleteFiles: process.env.APP_ENABLE_DELETE_FILES || appConfigs.enableDeleteFiles
                , deleteFilesCronScheduler: process.env.APP_DELETE_FILES_CRON_SCHEDULER || appConfigs.deleteFilesCronScheduler
                , deleteFilesDaysOld: process.env.APP_DELETE_FILES_DAYS_OLD || appConfigs.deleteFilesDaysOld
                , dataDirectoryPath: process.env.APP_DATA_DIRECTORY_PATH || appConfigs.dataDirectoryPath
            };

            const logConfigs = { ...logConfigsDefault, ...fileConfigs.log };

            const log = {
                dir: process.env.LOG_DIR || logConfigs.dir
                , level: process.env.LOG_LEVEL || logConfigs.level
                , fileName: process.env.LOG_FILENAME || logConfigs.fileName
                , fileSize: process.env.LOG_FILESIZE || logConfigs.fileSize
                , fileNum: process.env.LOG_FILENUM || logConfigs.fileNum
                , console: process.env.LOG_CONSOLE || logConfigs.console
            };

            const graphServiceConfigs = { ...graphServiceConfigsDefault, ...fileConfigs.services.graph };

            const services = {
                graph: {
                    clientId: process.env.GRAPH_CLIENT_ID || graphServiceConfigs.clientId
                    , tenantId: process.env.GRAPH_TENANT_ID || graphServiceConfigs.tenantId
                    , clientSecret: process.env.GRAPH_CLIENT_SECRET || graphServiceConfigs.clientSecret
                    , enableReports: process.env.GRAPH_ENABLE_REPORTS || graphServiceConfigs.enableReports
                    , reportsCronScheduler: process.env.GRAPH_REPORTS_CRON_SCHEDULER || graphServiceConfigs.reportsCronScheduler
                    , enableThreatAssessmentRequests: process.env.GRAPH_ENABLE_THREAT_ASSESSMENT_REQUESTS || graphServiceConfigs.enableThreatAssessmentRequests
                    , threatAssessmentRequestsCronScheduler: process.env.GRAPH_THREAT_ASSESSMENT_REQUESTS_CRON_SCHEDULER || graphServiceConfigs.threatAssessmentRequestsCronScheduler
                    , enableInsights: process.env.GRAPH_ENABLE_INSIGHTS || graphServiceConfigs.enableInsights
                    , insightsCronScheduler: process.env.GRAPH_INSIGHTS_CRON_SCHEDULER || graphServiceConfigs.insightsCronScheduler
                    , enableMail: process.env.GRAPH_ENABLE_MAIL || graphServiceConfigs.enableMail
                    , mailCronScheduler: process.env.GRAPH_MAIL_CRON_SCHEDULER || graphServiceConfigs.mailCronScheduler
                }
            };

            safeGuardConfigsCheck(services.graph, GRAPH_SERVICE_REQUIRED_CONFIGS_LST);

            configs = {
                app: app
                , log: log
                , services: services
            };

            initiated = true;
        }
    };

    const getConfigs = _ => {
        verify();
        return configs;
    };

    return {
        init: init
        , getConfigs: getConfigs
    };

}();

module.exports = config;