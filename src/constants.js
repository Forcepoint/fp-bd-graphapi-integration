"use strict";

export const CONF_DIR = './config/';

export const GRAPH_SERVICE_REQUIRED_CONFIGS_LST = ['tenantId'
    , 'clientId'
    , 'clientSecret']

export const DATE_FORMAT = 'YYYY-MM-DD';

export const GEAPH_API = 'https://graph.microsoft.com/';
export const GEAPH_API_VERSION = 'v1.0/';
export const GEAPH_API_REPORTS_NAME_SPACE = 'reports/';
export const GEAPH_API_BATCH_NAME_SPACE = '$batch'

export const REPORTS = {
    TEAMS_DEVICE_USAGE_USER_DETAIL: 'getTeamsDeviceUsageUserDetail',
    TEAMS_USER_ACTIVITY_USER_DETAIL: 'getTeamsUserActivityUserDetail',
    EMAIL_APP_USAGE_USER_DETAIL: 'getEmailAppUsageUserDetail',
    EMAIL_ACTIVITY_USER_DETAIL: 'getEmailActivityUserDetail',
    ONE_DRIVE_ACTIVITY_USER_DETAIL: 'getOneDriveActivityUserDetail',
    ONE_DRIVE_USAGE_ACCOUNT_DETAIL: 'getOneDriveUsageAccountDetail',
    YAMMER_ACTIVITY_USER_DETAIL: 'getYammerActivityUserDetail',
    YAMMER_DEVICE_USAGE_USER_DETAIL: 'getYammerDeviceUsageUserDetail',
    SKYPE_FOR_BUSINESS_DEVICE_USAGE_USER_DETAIL: 'getSkypeForBusinessDeviceUsageUserDetail',
    OFFICE365_ACTIVE_USER_DETAIL: 'getOffice365ActiveUserDetail',
    SHARE_POINT_ACTIVITY_USER_DETAIL: 'getSharePointActivityUserDetail'
}

export const REPORTS_BY_PERIOD_ONLY = {
    MAILBOX_USAGE_DETAIL: 'getMailboxUsageDetail'
}

export const REPORTS_NO_FILTER = {
    OFFICE365_ACTIVATIONS_USER_DETAIL: 'getOffice365ActivationsUserDetail'
}

export const REPORTS_FILTER = {
    BY_DATE: 'date',
    BY_PERIOD: 'period'
}

export const REPORTS_PERIOD = {
    D7: '\'D7\'',
    D30: '\'D30\'',
    D90: '\'D90\'',
    D180: '\'D180\''
}

export const GRAGH_DIRS = {
    DATA: 'data',
    LOGS: 'logs',
    REPORTS: 'reports',
    REPORTS_BY_DATE: 'reports/by-date',
    REPORTS_BY_PERIOD: 'reports/by-seven-days-period',
    THREAT_ASSESSMENT_REQUESTS: 'threat-assessment-requests',
    INSIGHTS: 'insights',
    EMAILS: 'emails'
}