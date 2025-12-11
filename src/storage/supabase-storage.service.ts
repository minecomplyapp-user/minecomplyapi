import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

export interface SignedUploadUrl {
  url: string;
  path: string;
  token?: string;
}

@Injectable()
export class SupabaseStorageService {
  private readonly client: ReturnType<typeof createClient>;
  private readonly bucket: string;
  private readonly uploadsPrefix: string;
  private readonly logger = new Logger(SupabaseStorageService.name);

  constructor(private readonly configService: ConfigService) {
    const url = this.configService.getOrThrow<string>('supabase.url');
    const serviceRoleKey = this.configService.getOrThrow<string>(
      'supabase.serviceRoleKey',
    );
    this.bucket = this.configService.getOrThrow<string>(
      'supabase.storageBucket',
    );
    const rawPrefix = this.configService.get<string>(
      'supabase.storageUploadsPath',
    );

    this.uploadsPrefix = normalizePrefix(rawPrefix ?? 'uploads/');

    // Initialize Supabase client with service role key
    // Service role key bypasses RLS and should have full access
    this.client = createClient(url, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        // Ensure we're using service role, not user session
        detectSessionInUrl: false,
      },
    });
  }

  async createSignedUploadUrl(
    originalFilename: string,
    options?: { upsert?: boolean },
  ): Promise<SignedUploadUrl> {
    const objectPath = this.buildObjectPath(originalFilename);

    this.logger.log(`Creating signed upload URL for path: ${objectPath}`);
    this.logger.log(`Options: ${JSON.stringify(options)}`);
    this.logger.log(`Bucket: ${this.bucket}`);

    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUploadUrl(objectPath, {
        upsert: options?.upsert ?? false,
      });

    this.logger.log(
      `Supabase response - Error: ${error ? JSON.stringify(error) : 'NONE'}`,
    );
    this.logger.log(
      `Supabase response - Data: ${
        data
          ? JSON.stringify({
              hasSignedUrl: !!data.signedUrl,
              signedUrlLength: data.signedUrl?.length,
              token: (data as { token?: string }).token ? 'PRESENT' : 'NONE',
              path: objectPath,
            })
          : 'NONE'
      }`,
    );

    if (error || !data?.signedUrl) {
      this.logger.error(
        `Failed to create signed upload URL for ${objectPath}: ${error?.message}`,
      );
      throw new InternalServerErrorException('Unable to create upload URL');
    }

    return {
      url: data.signedUrl,
      path: objectPath,
      token: (data as { token?: string }).token,
    };
  }

  async createSignedDownloadUrl(path: string, expiresIn = 60): Promise<string> {
    const { data, error } = await this.client.storage
      .from(this.bucket)
      .createSignedUrl(path, expiresIn);

    if (error || !data?.signedUrl) {
      this.logger.error(
        `Failed to create signed download URL for ${path}: ${error?.message}`,
      );
      throw new InternalServerErrorException('Unable to create download URL');
    }

    return data.signedUrl;
  }

  getPublicUrl(path: string): string {
    const { data } = this.client.storage.from(this.bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Format Supabase error for logging
   */
  private formatSupabaseError(error: any): string {
    if (!error) {
      return 'Unknown error';
    }

    const errorDetails: Record<string, any> = {};

    // Extract common error properties
    if (error.message) errorDetails.message = error.message;
    if (error.status) errorDetails.status = error.status;
    if (error.statusCode) errorDetails.statusCode = error.statusCode;
    if (error.name) errorDetails.name = error.name;
    if (error.error) errorDetails.error = error.error;
    if (error.code) errorDetails.code = error.code;

    // Check for originalError which might contain more details
    if (error.originalError) {
      if (error.originalError.message) {
        errorDetails.originalErrorMessage = error.originalError.message;
      }
      if (error.originalError.status) {
        errorDetails.originalErrorStatus = error.originalError.status;
      }
      if (error.originalError.statusCode) {
        errorDetails.originalErrorStatusCode = error.originalError.statusCode;
      }
      // Try to stringify the entire originalError
      try {
        errorDetails.originalErrorFull = JSON.stringify(error.originalError);
      } catch {
        errorDetails.originalErrorFull = String(error.originalError);
      }
    }

    // Try to get all properties (including non-enumerable)
    try {
      const allProps = Object.getOwnPropertyNames(error);
      for (const prop of allProps) {
        if (!errorDetails[prop] && prop !== 'stack') {
          try {
            const value = error[prop];
            // Try to stringify if it's an object
            if (typeof value === 'object' && value !== null) {
              try {
                errorDetails[prop] = JSON.stringify(value);
              } catch {
                errorDetails[prop] = String(value);
              }
            } else {
              errorDetails[prop] = value;
            }
          } catch {
            // Skip properties that can't be accessed
          }
        }
      }
    } catch {
      // If we can't enumerate properties, continue with what we have
    }

    // If we have details, stringify them
    if (Object.keys(errorDetails).length > 0) {
      return JSON.stringify(errorDetails, null, 2);
    }

    // Fallback to string representation
    return String(error);
  }

  /**
   * Download a file directly from Supabase Storage using service role key
   * This bypasses the need for signed URLs when using service role authentication
   */
  async downloadFile(path: string): Promise<Buffer> {
    // Pre-download validation
    if (!path || typeof path !== 'string' || path.trim().length === 0) {
      this.logger.error('Invalid path provided to downloadFile');
      throw new InternalServerErrorException('Invalid file path provided');
    }

    const serviceRoleKey = this.configService.get<string>(
      'supabase.serviceRoleKey',
    );
    if (!serviceRoleKey || serviceRoleKey.trim().length === 0) {
      this.logger.error('Service role key is not configured');
      throw new InternalServerErrorException(
        'Supabase service role key is not configured',
      );
    }

    if (!this.bucket || this.bucket.trim().length === 0) {
      this.logger.error('Storage bucket is not configured');
      throw new InternalServerErrorException(
        'Supabase storage bucket is not configured',
      );
    }

    // Diagnostic logging
    const maskedKey = serviceRoleKey
      ? `${serviceRoleKey.substring(0, 10)}...${serviceRoleKey.substring(serviceRoleKey.length - 4)}`
      : 'NOT SET';
    this.logger.log(
      `[downloadFile] Attempting download - Bucket: ${this.bucket}, Path: ${path}, ServiceRoleKey: ${maskedKey}`,
    );

    try {
      const { data, error } = await this.client.storage
        .from(this.bucket)
        .download(path);

      // Log full response structure
      this.logger.log(
        `[downloadFile] Supabase response - Data: ${data ? 'PRESENT' : 'NULL'}, Error: ${error ? 'PRESENT' : 'NONE'}`,
      );

      if (error) {
        const errorDetails = this.formatSupabaseError(error);
        this.logger.error(
          `[downloadFile] Supabase error details: ${errorDetails}`,
        );
        // Log raw error for deeper debugging
        try {
          this.logger.error(
            `[downloadFile] Raw error: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`,
          );
        } catch (e) {
          this.logger.error(`[downloadFile] Could not stringify error: ${e}`);
        }
        this.logger.error(
          `Failed to download file from ${path}: ${errorDetails}`,
        );
        throw new InternalServerErrorException(
          `Unable to download file: ${errorDetails}`,
        );
      }

      if (!data) {
        this.logger.error(
          `[downloadFile] No data returned for path: ${path}`,
        );
        throw new InternalServerErrorException(
          'Unable to download file: No data returned',
        );
      }

      // Convert Blob to Buffer
      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      this.logger.log(
        `[downloadFile] Successfully downloaded ${buffer.length} bytes from ${path}`,
      );
      return buffer;
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      const errorDetails = this.formatSupabaseError(error);
      this.logger.error(
        `[downloadFile] Unexpected error downloading file ${path}: ${errorDetails}`,
      );
      throw new InternalServerErrorException(
        `Unable to download file: ${errorDetails}`,
      );
    }
  }

  async remove(path: string): Promise<void> {
    // Validate input path
    if (!path || typeof path !== 'string' || path.trim().length === 0) {
      this.logger.error('Invalid path provided to remove method');
      throw new InternalServerErrorException('Invalid file path provided');
    }

    const trimmedPath = path.trim();

    try {
      const { error } = await this.client.storage
        .from(this.bucket)
        .remove([trimmedPath]);

      if (error) {
        this.logger.error(
          `Failed to remove object ${trimmedPath}: ${error.message}`,
        );
        throw new InternalServerErrorException('Unable to remove storage object');
      }
    } catch (error) {
      // Re-throw InternalServerErrorException as-is
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      // Handle unexpected errors
      this.logger.error(
        `Unexpected error removing object ${trimmedPath}: ${error}`,
      );
      throw new InternalServerErrorException('Unable to remove storage object');
    }
  }

  private buildObjectPath(filename: string): string {
    const safeName = sanitizeFilename(filename);
    const unique = randomUUID();
    if (!this.uploadsPrefix) {
      return `${unique}-${safeName}`;
    }
    return `${this.uploadsPrefix}/${unique}-${safeName}`;
  }
}

const sanitizeFilename = (filename: string): string => {
  if (!filename) {
    return 'file';
  }
  const normalized = filename.replace(/\\/g, '/');
  const base = normalized.split('/').pop() ?? 'file';
  return base.replace(/[^a-zA-Z0-9._-]/g, '_');
};

const normalizePrefix = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }
  return trimmed.replace(/^\/+/, '').replace(/\/+$/, '');
};
