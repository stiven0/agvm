import { ErrorCode } from './codes';

/**
 * Catches any errors that occur in the provided function and logs them to the
 * console. If the error is an instance of AGVMError, it logs the error code and
 * message. Otherwise, it logs a generic error message with the error code as
 * ErrorCode.UnexpectedError. After logging the error, it exits the process with
 * a status code of 1.
 *
 * @param fn the function to run with the error handler
 */
export async function withErrorHandler(fn: () => Promise<void>) {
  try {
    await fn();
  } catch (error) {
    if (error instanceof AGVMError) {
      console.error(`❌ [${error.code}] ${error.message}`);
    } else {
      console.error(`❌ [${ErrorCode.UnexpectedError}]:`, error);
    }
    process.exit(1);
  }
}

export class AGVMError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'AGVMError';
  }
}
