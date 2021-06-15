"use strict";

const del = require('del');
const fs = require('fs');
const glob = require('glob');
const logger = require('./logging').getLogger();
const moment = require('moment');
import { DATE_FORMAT, GRAGH_DIRS } from './constants';

exports.getPreviosDateByDays = (number, format = DATE_FORMAT) => {
  return moment().subtract(number, 'days').format(format);
};

exports.getTodaysDate = (format = DATE_FORMAT) => {
  return moment().format();
};

exports.getYesterdaysDate = (format = DATE_FORMAT) => {
  return moment().subtract(1, 'days').format(format);
};

exports.getPreviousMonth = number => {
  return moment().subtract(number, 'months').toISOString();
};

exports.getISOTodaysDateWithZeroTime = _ => {
  return moment().startOf('day').toISOString();
};

exports.getISOCurrentDateTime = _ => {
  return moment().toISOString();
};

exports.getISOPreviousDateByDay = number => {
  return moment().subtract(number, 'days').toISOString();
};

exports.delayLoop = (fn, delay) => {
  return (x, i) => {
    setTimeout(() => {
      fn(x);
    }, i * delay);
  }
};

export const generateUniqueFilePath = (dataDirectoryPath, subDirectoryName, fileName) => {
  logger.debug(`[util|generateUniqueFilePath|in]`);
  const dirPath = subDirectoryName ? `${dataDirectoryPath}/${subDirectoryName}` : dataDirectoryPath
  const unixTimestamp = moment().valueOf();
  try {
    fs.mkdirSync(dirPath, { recursive: true });
    logger.debug(`${dirPath} is created!`);
  } catch (err) {
    logger.error(`[util|generateUniqueFilePath] ${dirPath} - (%o)`, err);
  }
  return `${dirPath}/${fileName}_${unixTimestamp}`;
};

export const appendContentToFile = (fileFullPath, content) => {
  logger.debug(`[util|appendContentToFile|in]`);
  const f = fs.createWriteStream(fileFullPath, { flags: 'a' });
  f.on('error', function (err) {
    logger.error(`[util|appendContentToFile] - (%o)`, err);
    f.end();
  });
  const jsonContent = JSON.stringify(content);
  f.write(jsonContent);
  f.end();
};

exports.writeToUniqueFile = (dataDirectoryPath, subDirectoryName, fileName, content) => {
  logger.debug(`[util|writeToUniqueFile|in]`);
  if (content) {
    const fileFullPath = generateUniqueFilePath(dataDirectoryPath, subDirectoryName, fileName)
    appendContentToFile(fileFullPath, content);
  }
};

exports.deleteFile = async filePath => {
  logger.debug(`[util|deleteFile|in]`);
  // delete directory recursively
  try {
    await del(filePath);
    logger.debug(`${filePath} is deleted!`);
  } catch (err) {
    logger.error(`[util|deleteFile] ${filePath} - (%o)`, err);
  }
};

exports.listFilesOlderThen = (directoryPath, endTimestamp) => {
  logger.debug(`[util|listFilesOlderThen|in]`);
  let fileList = [];
  try {
    const files = glob.sync(directoryPath + '/**/*');
    files.forEach(function (file) {
      let stat = fs.statSync(file);
      if (stat.isFile()) {
        let createdTime = new Date(stat.ctime).getTime();
        if (createdTime <= endTimestamp) {
          fileList.push(file);
        }
      }
    });
  } catch (err) {
    logger.error(`[util|listFilesOlderThen] ${directoryPath} - (%o)`, err);
  }
  return fileList;
};

exports.listEmptyDirectories = directoryPath => {
  logger.debug(`[util|listEmptyDirectories|in]`);
  let directoryList = [];
  try {
    const files = glob.sync(directoryPath + '/**/*');
    files.forEach(function (file) {
      let stat = fs.statSync(file);
      if (stat.isDirectory() && fs.readdirSync(file).length === 0) {
        directoryList.push(file);
      }
    });
  } catch (err) {
    logger.error(`[util|listEmptyDirectories] ${directoryPath} - (%o)`, err);
  }
  return directoryList;
};

exports.enrichListData = (list, data, label) => {
  logger.debug(`[util|enrichListData|in]`);
  let enrichedList = [];
  let dataWrapped = {};
  let key = `enriched-${label}`;
  dataWrapped[key] = data;
  list.forEach(function (item) {
    let enrichedItem = { ...item, ...dataWrapped };
    enrichedList.push(enrichedItem);
  });
  return enrichedList;
};

exports.saveReport = (dataDirectoryPath, subDirectoryName = GRAGH_DIRS.REPORTS, reportType, data) => {
  logger.debug(`[util|saveReport|in]`);
  let createFile = true;
  const numberOfLines = data.split('\r\n').length;
  if (numberOfLines === 1) {
    logger.debug(reportType + ' is empty');
    createFile = false;
  } else if (numberOfLines === 2) {
    if (data.split('\r\n').pop() === "") {
      logger.debug(reportType + ' is empty');
      createFile = false;
    }
  }

  if (createFile) {
    const path = generateUniqueFilePath(dataDirectoryPath, subDirectoryName, reportType);
    fs.writeFile(path, data, 'utf8', function (err) {
      if (err) {
        logger.error(`[util|saveReport] - (%o)`, err);
      } else {
        logger.debug('It\'s saved! ' + path);
      }
    });
  }
};
