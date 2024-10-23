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
import type { BlockBlobClient } from "@azure/storage-blob"
import {
  BlobSASPermissions,
  BlobServiceClient,
  generateBlobSASQueryParameters,
  SASProtocol,
  StorageSharedKeyCredential,
} from "@azure/storage-blob"

import type { RequestTemplate, StorageKey, StorageProvider } from "../core"

/**
 * Azure Blob Storage provider implementation.
 * Supports generating signed URLs for file upload, download, and deletion.
 */
export class AzureProvider implements StorageProvider {
  private readonly sharedKeyCredential: StorageSharedKeyCredential
  private readonly blobServiceClient: BlobServiceClient
  private readonly containerName: string

  /**
   * Creates an instance of AzureProvider.
   *
   * @param config - Configuration for the Azure Blob Storage client.
   */
  constructor(config: AzureClientConfig) {
    this.sharedKeyCredential = new StorageSharedKeyCredential(config.accountName, config.accountKey)
    this.blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionString)
    this.containerName = config.containerName
  }

  /**
   * Prepares a signed URL for downloading a file from Azure Blob Storage.
   *
   * @param key - The key of the file to download.
   * @param expiresIn - URL expiration time in seconds.
   * @returns A promise that resolves to the request template.
   */
  public async prepareDownload(key: StorageKey, expiresIn: number): Promise<RequestTemplate> {
    const blockBlobClient = this.getBlockBlobClient(key)
    const sasToken = this.generateSasToken(blockBlobClient, expiresIn, "r")
    const url = `${blockBlobClient.url}?${sasToken}`
    return { url, headers: { "x-ms-blob-type": "BlockBlob" } }
  }

  /**
   * Prepares a signed URL for uploading a file to Azure Blob Storage.
   *
   * @param key - The key of the file to upload.
   * @param expiresIn - URL expiration time in seconds.
   * @returns A promise that resolves to the request template.
   */
  public async prepareUpload(key: StorageKey, expiresIn: number): Promise<RequestTemplate> {
    const blockBlobClient = this.getBlockBlobClient(key)
    const sasToken = this.generateSasToken(blockBlobClient, expiresIn, "w")
    const url = `${blockBlobClient.url}?${sasToken}`
    return { url, headers: { "x-ms-blob-type": "BlockBlob" } }
  }

  /**
   * Prepares a signed URL for deleting a file from Azure Blob Storage.
   *
   * @param key - The key of the file to delete.
   * @param expiresIn - URL expiration time in seconds.
   * @returns A promise that resolves to the request template.
   */
  public async prepareDelete(key: StorageKey, expiresIn: number): Promise<RequestTemplate> {
    const blockBlobClient = this.getBlockBlobClient(key)
    const sasToken = this.generateSasToken(blockBlobClient, expiresIn, "d")
    const url = `${blockBlobClient.url}?${sasToken}`
    return { url, headers: {} }
  }

  /**
   * Checks if a file with the given key exists in Azure Blob Storage.
   *
   * @param key - The key of the file to check.
   * @returns A promise that resolves to a boolean indicating whether the file exists.
   */
  public async exists(key: StorageKey): Promise<boolean> {
    const blockBlobClient = this.getBlockBlobClient(key)
    return await blockBlobClient.exists()
  }

  /**
   * Generates a SAS token for a given blob client.
   *
   * @param blobClient - The block blob client.
   * @param expiresIn - SAS token expiration time in seconds.
   * @param permissions - Permissions for the SAS token ("r" for read, "w" for write, "d" for delete).
   * @returns The generated SAS token.
   */
  private generateSasToken(blobClient: BlockBlobClient, expiresIn: number, permissions: string): string {
    const start = new Date()
    const expiry = new Date(start.getTime() + expiresIn * 1000)

    const sasPermissions = new BlobSASPermissions()
    sasPermissions.read = permissions.includes("r")
    sasPermissions.write = permissions.includes("w")
    sasPermissions.delete = permissions.includes("d")

    return generateBlobSASQueryParameters(
      {
        containerName: this.containerName,
        blobName: blobClient.name,
        permissions: sasPermissions,
        startsOn: start,
        expiresOn: expiry,
        protocol: SASProtocol.HttpsAndHttp,
      },
      this.sharedKeyCredential
    ).toString()
  }

  /**
   * Gets a BlockBlobClient for the specified key.
   *
   * @param key - The key of the blob.
   * @returns The BlockBlobClient instance.
   */
  private getBlockBlobClient(key: StorageKey): BlockBlobClient {
    return this.blobServiceClient.getContainerClient(this.containerName).getBlockBlobClient(key)
  }
}

/**
 * Configuration interface for the Azure Blob Storage client.
 */
export interface AzureClientConfig {
  connectionString: string
  containerName: string
  accountName: string
  accountKey: string
}

export const createAzureClientConfig = async <TConfig extends AzureClientConfig>(config: TConfig): Promise<TConfig> => {
  return config
}
