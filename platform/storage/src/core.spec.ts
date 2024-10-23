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
import { beforeEach, describe, expect, it, vi } from "vitest"

import type { RequestTemplate, StorageKey, StorageProvider } from "./core"
import { StorageService } from "./core"

// Mock implementation of the StorageProvider interface
class MockProvider implements StorageProvider {
  async prepareDownload(key: StorageKey, expiresIn: number): Promise<RequestTemplate> {
    return { url: `https://example.com/download/${key}?expiresIn=${expiresIn}`, headers: {} }
  }

  async prepareUpload(key: StorageKey, expiresIn: number): Promise<RequestTemplate> {
    return { url: `https://example.com/upload/${key}?expiresIn=${expiresIn}`, headers: {} }
  }

  async prepareDelete(key: StorageKey, expiresIn: number): Promise<RequestTemplate> {
    return { url: `https://example.com/delete/${key}?expiresIn=${expiresIn}`, headers: {} }
  }

  async exists(key: StorageKey): Promise<boolean> {
    return key === "existing-file.txt"
  }
}

describe("StorageService", () => {
  let storageService: StorageService
  let mockProvider: MockProvider
  let fetchMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    mockProvider = new MockProvider()
    storageService = new StorageService({ provider: mockProvider })
    fetchMock = vi.fn()
    global.fetch = fetchMock as unknown as typeof fetch
  })

  it("should prepare a download request", async () => {
    const key: StorageKey = "test/download.txt"
    const request = await storageService.prepareDownload(key)
    expect(request.url).toBe(`https://example.com/download/${key}?expiresIn=3600`)
  })

  it("should prepare an upload request", async () => {
    const key: StorageKey = "test/upload.txt"
    const request = await storageService.prepareUpload(key)
    expect(request.url).toBe(`https://example.com/upload/${key}?expiresIn=3600`)
  })

  it("should prepare a delete request", async () => {
    const key: StorageKey = "test/delete.txt"
    const request = await storageService.prepareDelete(key)
    expect(request.url).toBe(`https://example.com/delete/${key}?expiresIn=3600`)
  })

  it("should check if a key exists", async () => {
    const existingKey: StorageKey = "existing-file.txt"
    const nonExistingKey: StorageKey = "non-existing-file.txt"

    const exists = await storageService.exists(existingKey)
    expect(exists).toBe(true)

    const doesNotExist = await storageService.exists(nonExistingKey)
    expect(doesNotExist).toBe(false)
  })

  it("should upload a file", async () => {
    const key: StorageKey = "test/upload.txt"
    const content = Buffer.from("Hello, World!")

    fetchMock.mockResolvedValue({ ok: true } as Response)

    const resultKey = await storageService.upload(key, content)

    expect(fetchMock).toHaveBeenCalledWith(`https://example.com/upload/${key}?expiresIn=3600`, {
      method: "PUT",
      body: content,
      headers: {},
    })
    expect(resultKey).toBe(key)
  })

  it("should download a file", async () => {
    const key: StorageKey = "test/file.txt"
    const content = "Hello, World!"

    fetchMock.mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new TextEncoder().encode(content).buffer,
    } as Response)

    const downloadedContent = await storageService.download(key)

    expect(fetchMock).toHaveBeenCalledWith(`https://example.com/download/${key}?expiresIn=3600`, { method: "GET" })
    expect(downloadedContent.toString()).toBe(content)
  })

  it("should delete a file", async () => {
    const key: StorageKey = "test/file.txt"

    fetchMock.mockResolvedValue({ ok: true } as Response)

    await storageService.delete(key)

    expect(fetchMock).toHaveBeenCalledWith(`https://example.com/delete/${key}?expiresIn=3600`, { method: "DELETE" })
  })
})
