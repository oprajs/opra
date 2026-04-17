/**
 * ILogger
 *
 * Interface for logging operations within the CLI.
 */
export interface ILogger {
  /**
   * Logs a general message.
   *
   * @param message - The message to log.
   * @param optionalParams - Additional parameters for the log message.
   */
  log(message: any, ...optionalParams: any[]);

  /**
   * Logs an error message.
   *
   * @param message - The error message to log.
   * @param optionalParams - Additional parameters for the error message.
   */
  error(message: any, ...optionalParams: any[]);

  /**
   * Logs a warning message.
   *
   * @param message - The warning message to log.
   * @param optionalParams - Additional parameters for the warning message.
   */
  warn(message: any, ...optionalParams: any[]);

  /**
   * Logs a debug message.
   *
   * @param message - The debug message to log.
   * @param optionalParams - Additional parameters for the debug message.
   */
  debug?(message: any, ...optionalParams: any[]);

  /**
   * Logs a verbose message.
   *
   * @param message - The verbose message to log.
   * @param optionalParams - Additional parameters for the verbose message.
   */
  verbose?(message: any, ...optionalParams: any[]);
}
