/**
 * Interface for logging services used within the OPRA framework.
 * This interface defines standard logging methods that can be implemented
 * by various logging providers (e.g., Winston, Pino, or a simple console logger).
 */
export interface ILogger {
  /**
   * Logs an error message.
   *
   * @param message - The error message or object.
   * @param optionalParams - Additional parameters for formatting the message.
   */
  error(message: any, ...optionalParams: any[]): void;

  /**
   * Logs a general log message.
   *
   * @param message - The message or object.
   * @param optionalParams - Additional parameters for formatting the message.
   */
  log?(message: any, ...optionalParams: any[]): void;

  /**
   * Logs an informational message.
   *
   * @param message - The message or object.
   * @param optionalParams - Additional parameters for formatting the message.
   */
  info?(message: any, ...optionalParams: any[]): void;

  /**
   * Logs a warning message.
   *
   * @param message - The message or object.
   * @param optionalParams - Additional parameters for formatting the message.
   */
  warn?(message: any, ...optionalParams: any[]): void;

  /**
   * Logs a fatal error message.
   *
   * @param message - The message or object.
   * @param optionalParams - Additional parameters for formatting the message.
   */
  fatal?(message: any, ...optionalParams: any[]): void;

  /**
   * Logs a debug message.
   *
   * @param message - The message or object.
   * @param optionalParams - Additional parameters for formatting the message.
   */
  debug?(message: any, ...optionalParams: any[]): void;

  /**
   * Logs a verbose message.
   *
   * @param message - The message or object.
   * @param optionalParams - Additional parameters for formatting the message.
   */
  verbose?(message: any, ...optionalParams: any[]): void;
}
