/**
 * This file is part of the Kreios platform.
 *
 * Copyright (c) 2024 KREIOS S.A.R.L
 * Licensed under the MIT License (Expat). You may obtain a copy of the License
 * in the LICENSE file in the root directory of this source tree.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

import type { RequestTemplate, StorageKey, StorageProvider } from "../core"

/**
 * S3 storage provider implementation for interacting with AWS S3.
 * Supports generating signed URLs for file upload, download, and deletion.
 */
export class S3Provider implements StorageProvider {
  private readonly s3Client: S3Client
  private readonly bucket: string

  /**
   * Creates an instance of S3Provider.
   *
   * @param config - Configuration for the S3 client.
   */
  constructor(config: S3ClientConfig) {
    this.s3Client = new S3Client(config)
    this.bucket = config.bucket
  }

  /**
   * Prepares a signed URL for downloading a file from S3.
   *
   * @param key - The key of the file to download.
   * @param expiresIn - URL expiration time in seconds.
   * @returns A promise that resolves to a request template.
   */
  public async prepareDownload(key: StorageKey, expiresIn: number): Promise<RequestTemplate> {
    const command = new GetObjectCommand({ Bucket: this.bucket, Key: key })
    const url = await getSignedUrl(this.s3Client, command, { expiresIn })
    return { url, headers: {} }
  }

  /**
   * Prepares a signed URL for uploading a file to S3.
   *
   * @param key - The key of the file to upload.
   * @param expiresIn - URL expiration time in seconds.
   * @returns A promise that resolves to a request template.
   */
  public async prepareUpload(key: StorageKey, expiresIn: number): Promise<RequestTemplate> {
    const command = new PutObjectCommand({ Bucket: this.bucket, Key: key })
    const url = await getSignedUrl(this.s3Client, command, { expiresIn })
    return { url, headers: {} }
  }

  /**
   * Prepares a signed URL for deleting a file from S3.
   *
   * @param key - The key of the file to delete.
   * @param expiresIn - URL expiration time in seconds.
   * @returns A promise that resolves to a request template.
   */
  public async prepareDelete(key: StorageKey, expiresIn: number): Promise<RequestTemplate> {
    const command = new DeleteObjectCommand({ Bucket: this.bucket, Key: key })
    const url = await getSignedUrl(this.s3Client, command, { expiresIn })
    return { url, headers: {} }
  }

  /**
   * Checks if a file with the given key exists in S3.
   *
   * @param key - The key of the file to check.
   * @returns A promise that resolves to a boolean indicating whether the file exists.
   */
  public async exists(key: StorageKey): Promise<boolean> {
    try {
      await this.s3Client.send(new GetObjectCommand({ Bucket: this.bucket, Key: key }))
      return true
    } catch {
      return false
    }
  }
}

/**
 * Configuration interface for the S3 client.
 */
export interface S3ClientConfig {
  region: string
  endpoint?: string
  bucket: string
  credentials: {
    accessKeyId: string
    secretAccessKey: string
  }
}

export const createS3ClientConfig = async <TConfig extends S3ClientConfig>(config: TConfig): Promise<TConfig> => {
  return config
}
