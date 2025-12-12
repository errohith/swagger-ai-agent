/**
 * Base application error class
 * All custom errors should extend this class
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;
  public readonly details?: unknown;

  /**
   * Creates an AppError instance
   * @param message - Human-readable error message
   * @param statusCode - HTTP status code
   * @param code - Machine-readable error code
   * @param isOperational - Whether this error is operational (expected) or programming error
   * @param details - Additional error details
   */
  constructor(
    message: string,
    statusCode: number = 500,
    code: string = 'INTERNAL_ERROR',
    isOperational: boolean = true,
    details?: unknown
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);

    // Set the prototype explicitly for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Converts error to JSON-serializable object
   */
  toJSON(): Record<string, unknown> {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * ValidationError
 * Thrown when input validation fails
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', true, details);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * SwaggerLoaderError
 * Thrown when loading Swagger/OpenAPI spec fails
 */
export class SwaggerLoaderError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 500, 'SWAGGER_LOADER_ERROR', true, details);
    Object.setPrototypeOf(this, SwaggerLoaderError.prototype);
  }
}

/**
 * SpecParseError
 * Thrown when parsing Swagger/OpenAPI spec fails
 */
export class SpecParseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'SPEC_PARSE_ERROR', true, details);
    Object.setPrototypeOf(this, SpecParseError.prototype);
  }
}

/**
 * NotFoundError
 * Thrown when a requested resource is not found
 */
export class NotFoundError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 404, 'NOT_FOUND', true, details);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * ExecutionError
 * Thrown when test execution fails
 */
export class ExecutionError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 500, 'EXECUTION_ERROR', true, details);
    Object.setPrototypeOf(this, ExecutionError.prototype);
  }
}

/**
 * Helper function to check if error is operational
 */
export function isOperationalError(error: Error): boolean {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
}
