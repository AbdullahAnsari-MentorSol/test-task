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
import path from "path"
import type { Readable } from "stream"
import { ulid } from "ulidx"

/**
 * Alias for the storage key type, which represents a unique identifier for stored files.
 */
export type StorageKey = string

/**
 * Interface for the storage provider.
 * Defines the methods each provider needs to implement for managing file uploads, downloads, and deletions.
 */
export interface StorageProvider {
  prepareDownload(key: StorageKey, expiresIn: number): Promise<RequestTemplate>

  prepareUpload(key: StorageKey, expiresIn: number): Promise<RequestTemplate>

  prepareDelete(key: StorageKey, expiresIn: number): Promise<RequestTemplate>

  exists(key: StorageKey): Promise<boolean>
}

/**
 * Data structure returned by providers containing both URL and request headers.
 */
export interface RequestTemplate {
  url: string
  headers: Record<string, string>
}

/**
 * Storage service class providing an abstract interface over a variety of storage backends.
 * This class interacts with the configured provider to generate signed URLs, upload, download, and delete files.
 */
export class StorageService {
  private provider: StorageProvider

  /**
   * Creates an instance of StorageService.
   *
   * @param config - Configuration for the storage service.
   */
  constructor(config: StorageServiceConfig) {
    this.provider = config.provider
    console.info("StorageService initialized with provider:", this.provider.constructor.name)
  }

  /**
   * Prepares a signed URL for downloading a file.
   *
   * @param key - The key of the file to download.
   * @param expiresIn - URL expiration time in seconds (default: 3600).
   * @returns A promise that resolves to the request template.
   */
  public async prepareDownload(key: StorageKey, expiresIn = 3600): Promise<RequestTemplate> {
    const requestTemplate = await this.provider.prepareDownload(key, expiresIn)
    console.info(`Prepared download URL for key: ${key}, URL: ${requestTemplate.url}`)
    return requestTemplate
  }

  /**
   * Prepares a signed URL for uploading a file.
   *
   * @param key - The key of the file to upload.
   * @param expiresIn - URL expiration time in seconds (default: 3600).
   * @returns A promise that resolves to the request template.
   */
  public async prepareUpload(key: StorageKey, expiresIn = 3600): Promise<RequestTemplate> {
    const requestTemplate = await this.provider.prepareUpload(key, expiresIn)
    console.info(`Prepared upload URL for key: ${key}, URL: ${requestTemplate.url}`)
    return requestTemplate
  }

  /**
   * Prepares a signed URL for deleting a file.
   *
   * @param key - The key of the file to delete.
   * @param expiresIn - URL expiration time in seconds (default: 3600).
   * @returns A promise that resolves to the request template.
   */
  public async prepareDelete(key: StorageKey, expiresIn = 3600): Promise<RequestTemplate> {
    const requestTemplate = await this.provider.prepareDelete(key, expiresIn)
    console.info(`Prepared delete URL for key: ${key}, URL: ${requestTemplate.url}`)
    return requestTemplate
  }

  /**
   * Checks if the file with the given key exists in the storage.
   *
   * @param key - The key of the file to check.
   * @returns A promise that resolves to a boolean indicating whether the file exists.
   */
  public async exists(key: StorageKey): Promise<boolean> {
    const exists = await this.provider.exists(key)
    console.info(`Checked existence for key: ${key}, exists: ${exists}`)
    return exists
  }

  /**
   * Uploads a file to the storage. Optionally overwrites the file if it already exists.
   *
   * @param key - The key of the file to upload.
   * @param body - The file content to upload.
   * @param overwrite - Whether to overwrite the file if it already exists (default: false).
   * @returns A promise that resolves to the storage key used for the uploaded file.
   */
  public async upload(key: StorageKey, body: Buffer | Readable | string, overwrite = false): Promise<StorageKey> {
    // Step 1: Check if the key already exists and generate a new key if necessary
    if (!overwrite && (await this.exists(key))) {
      console.log(`Key already exists: ${key}`)
      key = this.generateNewKey(key)
    }

    // Step 2: Prepare the upload URL and headers
    const { url, headers } = await this.prepareUpload(key)
    console.info(`Uploading file to key: ${key}, URL: ${url}`)

    // Step 3: Convert Readable streams to a compatible format if necessary
    const bodyData = await this.convertToBodyData(body)

    // Step 4: Perform the file upload using fetch
    const response = await fetch(url, {
      method: "PUT",
      body: bodyData,
      headers,
    })

    // Step 5: Check for upload success
    if (!response.ok) {
      console.error(`Failed to upload file to key: ${key}, status: ${response.status}`)
      throw new Error(`Failed to upload file to key: ${key}, status: ${response.status}`)
    }

    console.info(`Successfully uploaded file to key: ${key}`)
    return key
  }

  /**
   * Downloads a file from the storage.
   *
   * @param key - The key of the file to download.
   * @returns A promise that resolves to the file content as a Buffer.
   */
  public async download(key: StorageKey): Promise<Buffer> {
    try {
      // Step 1: Prepare the download URL
      const { url } = await this.prepareDownload(key)
      console.info(`Downloading file from key: ${key}, URL: ${url}`)

      // Step 2: Fetch the file content
      const response = await fetch(url, { method: "GET" })
      if (!response.ok) {
        console.error(`Failed to download file from key: ${key}, status: ${response.status}`)
        throw new Error(`Failed to download file from key: ${key}, status: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      console.info(`Successfully downloaded file from key: ${key}, size: ${arrayBuffer.byteLength} bytes`)

      // Step 3: Convert ArrayBuffer to Buffer
      return Buffer.from(arrayBuffer)
    } catch (error) {
      console.error(`Failed to download file from key: ${key}`, error)
      throw error
    }
  }

  /**
   * Deletes a file from the storage.
   *
   * @param key - The key of the file to delete.
   * @returns A promise that resolves when the file is deleted.
   */
  public async delete(key: StorageKey): Promise<void> {
    try {
      // Step 1: Prepare the delete URL
      const { url } = await this.prepareDelete(key)
      console.info(`Deleting file with key: ${key}, URL: ${url}`)

      // Step 2: Perform the file deletion using fetch
      const response = await fetch(url, { method: "DELETE" })

      if (!response.ok) {
        console.error(`Failed to delete file with key: ${key}, status: ${response.status}`)
        throw new Error(`Failed to delete file with key: ${key}, status: ${response.status}`)
      }

      console.info(`Successfully deleted file with key: ${key}`)
    } catch (error) {
      console.error(`Failed to delete file with key: ${key}`, error)
      throw error
    }
  }

  /**
   * Generates a new unique key for a file based on its original name and a ULID.
   *
   * @param key - The original file key.
   * @returns The new unique file key.
   */
  private generateNewKey(key: string): string {
    const extension = path.extname(key)
    const filenameWithoutExt = path.basename(key, extension)
    return `${filenameWithoutExt}_${ulid()}${extension}`
  }

  /**
   * Converts a Readable stream to a Buffer or string that can be sent via fetch.
   *
   * @param body - The file content to convert.
   * @returns A promise that resolves to the converted body content.
   */
  private async convertToBodyData(body: Buffer | Readable | string): Promise<BodyInit> {
    if (typeof body === "string" || Buffer.isBuffer(body)) {
      return body
    } else {
      const chunks: Uint8Array[] = []
      for await (const chunk of body) {
        chunks.push(chunk as Uint8Array)
      }
      return Buffer.concat(chunks)
    }
  }
}

/**
 * Configuration interface for the storage service.
 */
export interface StorageServiceConfig {
  provider: StorageProvider
}

/**
 * Creates a configuration object for the StorageService.
 */
export const createStorageServiceConfig = <TConfig extends StorageServiceConfig>(config: TConfig) => config
