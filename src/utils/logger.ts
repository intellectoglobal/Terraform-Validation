import * as winston from "winston";

const logLikeFormat = {
  transform(info: winston.Logform.TransformableInfo): winston.Logform.TransformableInfo {
    const { timestamp, message } = info;
    const level = info[Symbol.for("level")] as string;
    const args = info[Symbol.for("splat")] as unknown[];

    if (args === undefined) {
      info[Symbol.for("message")] = `${timestamp} [${level}] : ${message}`;
      return info;
    } else {
      const strArgs = args
        .map((arg) => {
          if (typeof arg !== "object") {
            return arg;
          }

          return arg instanceof Error
            ? `Error Message : ${arg.message} : stack : ${arg.stack}`
            : JSON.stringify(arg);
        })
        .join(" ");
      info[Symbol.for("message")] = `${timestamp} [${level}] : ${message} ${strArgs}`;
      return info;
    }
  },
};

const consoleTransport = new winston.transports.Console({
  level: "debug",
});

const logConfiguration: winston.LoggerOptions = {
  transports: [consoleTransport],
  format: winston.format.combine(
    winston.format.timestamp({ format: "DD MMM YYYY HH:mm:ss" }),
    winston.format.align(),
    logLikeFormat
  ),
};

export default winston.createLogger(logConfiguration);
