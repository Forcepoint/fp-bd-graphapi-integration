"use strict";

import path from 'path';
import winston from 'winston';

const logging = function () {

	let initiated = false;
	let logger;

	const verify = _ => {
		if (!initiated)
			throw new Error('!!! logging module not initiated !!!');
	};

	const init = (logConfigs) => {

		if (!initiated) {

			let transports = [
				new (winston.transports.File)({
					filename: path.join(logConfigs.dir, logConfigs.fileName),
					level: logConfigs.level,
					maxsize: logConfigs.fileSize,
					maxFiles: logConfigs.fileNum,
					format: winston.format.combine(
						winston.format.splat(),
						winston.format.timestamp(),
						winston.format.printf(info => {
							return `${info.timestamp} ${info.level}: ${info.message}`;
						})
					)
				})
			]

			if (logConfigs.console) {
				transports.push(new (winston.transports.Console)({
					level: logConfigs.level,
					format: winston.format.combine(
						winston.format.splat(),
						winston.format.timestamp(),
						winston.format.printf(info => {
							return `${info.timestamp} ${info.level}: ${info.message}`;
						})
					)
				}))
			}

			logger = winston.createLogger({
				transports: transports
			});
			initiated = true;
		}
		logger.info(`[logging|init|out] - logConfigs: (%o)`, logConfigs);
	};

	const getLogger = _ => {
		verify();
		return logger;
	};

	return {
		init: init
		, getLogger: getLogger
	};

}();

module.exports = logging;
