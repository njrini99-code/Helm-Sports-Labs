/**
 * API Request Validation Middleware
 * 
 * Provides utilities for validating API requests with Zod schemas
 * and standardized error responses.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ErrorCodes } from '@/lib/errors';

export interface ValidationOptions {
  schema: z.ZodSchema;
  errorMessage?: string;
}

/**
 * Validate request body against a Zod schema
 * Returns validated data or error response
 */
export function validateRequestBody<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  return validateRequestData(request, schema, 'body');
}

/**
 * Validate request query parameters against a Zod schema
 */
export function validateRequestQuery<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse } {
  return validateRequestData(request, schema, 'query');
}

/**
 * Validate request data (body or query)
 */
function validateRequestData<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>,
  source: 'body' | 'query'
): { success: true; data: T } | { success: false; response: NextResponse } {
  try {
    let rawData: unknown;

    if (source === 'body') {
      try {
        rawData = request.json ? request.json() : {};
      } catch {
        return {
          success: false,
          response: NextResponse.json(
            {
              error: 'Invalid JSON in request body',
              code: ErrorCodes.VALIDATION_FAILED,
            },
            { status: 400 }
          ),
        };
      }
    } else {
      const searchParams = request.nextUrl.searchParams;
      rawData = Object.fromEntries(searchParams.entries());
    }

    const result = schema.safeParse(rawData);

    if (!result.success) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Validation failed',
            code: ErrorCodes.VALIDATION_FAILED,
            details: result.error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
          { status: 400 }
        ),
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Validation error',
          code: ErrorCodes.VALIDATION_FAILED,
          message: error instanceof Error ? error.message : 'Unknown validation error',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Async wrapper for request body validation
 */
export async function validateRequestBodyAsync<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Validation failed',
            code: ErrorCodes.VALIDATION_FAILED,
            details: result.error.errors.map((err) => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code,
            })),
          },
          { status: 400 }
        ),
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return {
        success: false,
        response: NextResponse.json(
          {
            error: 'Invalid JSON in request body',
            code: ErrorCodes.VALIDATION_FAILED,
          },
          { status: 400 }
        ),
      };
    }

    return {
      success: false,
      response: NextResponse.json(
        {
          error: 'Validation error',
          code: ErrorCodes.VALIDATION_FAILED,
          message: error instanceof Error ? error.message : 'Unknown validation error',
        },
        { status: 400 }
      ),
    };
  }
}

/**
 * Common validation schemas
 */
export const commonSchemas = {
  uuid: z.string().uuid('Invalid UUID format'),
  email: z.string().email('Invalid email format'),
  url: z.string().url('Invalid URL format'),
  date: z.string().datetime('Invalid date format').or(z.date()),
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
  }),
  idParam: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),
};
