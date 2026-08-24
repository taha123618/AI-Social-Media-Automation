import { NextResponse } from 'next/server';
import { ZodError } from 'zod';

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_SESSION = 'INVALID_SESSION',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Business Logic
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  OPERATION_NOT_ALLOWED = 'OPERATION_NOT_ALLOWED',

  // External Services
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  OAUTH_ERROR = 'OAUTH_ERROR',
  SOCIAL_MEDIA_API_ERROR = 'SOCIAL_MEDIA_API_ERROR',

  // System
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',

  // Business Specific
  WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND',
  SOCIAL_ACCOUNT_NOT_CONNECTED = 'SOCIAL_ACCOUNT_NOT_CONNECTED',
  CONTENT_DRAFT_NOT_FOUND = 'CONTENT_DRAFT_NOT_FOUND',
  POST_SCHEDULE_CONFLICT = 'POST_SCHEDULE_CONFLICT',
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly context?: Record<string, unknown>;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
    statusCode: number = 500,
    isOperational: boolean = true,
    context?: Record<string, unknown>
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, AppError);
  }
}

export class ValidationError extends AppError {
  public readonly field?: string;

  constructor(message: string, field?: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.VALIDATION_ERROR, 400, true, context);
    this.field = field;
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Unauthorized access', context?: Record<string, unknown>) {
    super(message, ErrorCode.UNAUTHORIZED, 401, true, context);
  }
}

export class BusinessRuleError extends AppError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, ErrorCode.BUSINESS_RULE_VIOLATION, 422, true, context);
  }
}

export class ExternalServiceError extends AppError {
  constructor(
    message: string,
    serviceName: string,
    context?: Record<string, unknown>
  ) {
    super(
      message,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      502,
      true,
      { ...context, serviceName }
    );
  }
}

// Error response formatter
export function formatErrorResponse(error: AppError | Error | ZodError) {
  console.error('Error occurred:', {
    message: error.message,
    stack: error instanceof Error ? error.stack : undefined,
    name: error.constructor.name,
  });

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          ...(process.env.NODE_ENV === 'development' && {
            stack: error.stack,
            context: error.context,
          }),
        },
      },
      { status: error.statusCode }
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: {
          code: ErrorCode.VALIDATION_ERROR,
          message: 'Validation failed',
          details: error.issues.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
          })),
        },
      },
      { status: 400 }
    );
  }

  // Unknown error
  return NextResponse.json(
    {
      error: {
        code: ErrorCode.INTERNAL_SERVER_ERROR,
        message: process.env.NODE_ENV === 'development'
          ? error.message
          : 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && {
          stack: error instanceof Error ? error.stack : undefined,
        }),
      },
    },
    { status: 500 }
  );
}

// Error boundary wrapper for API routes
export function withErrorHandling(
  handler: (req: Request, context?: unknown) => Promise<Response>
) {
  return async (req: Request, context?: unknown): Promise<Response> => {
    try {
      return await handler(req, context);
    } catch (error) {
      return formatErrorResponse(error as Error);
    }
  };
}

// Async error wrapper for server actions
export function withAsyncErrorHandling<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error: unknown) {
      // Log the error with context
      console.error('Server action error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        functionName: fn.name,
        args: args.map((arg: unknown) =>
          typeof arg === 'object' && arg !== null
            ? '[Object]'
            : String(arg)
        ),
      });

      // Re-throw for the calling code to handle
      throw error;
    }
  };
}
