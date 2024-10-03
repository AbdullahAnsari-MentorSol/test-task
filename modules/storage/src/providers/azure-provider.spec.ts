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
import { beforeEach, describe, expect, it } from "vitest"

import { AzureProvider } from "./azure-provider"

const shouldRunTests =
  process.env.AZURE_CONNECTION_STRING &&
  process.env.AZURE_CONTAINER_NAME &&
  process.env.AZURE_ACCOUNT_NAME &&
  process.env.AZURE_ACCOUNT_KEY

describe.runIf(shouldRunTests)("AzureProvider", () => {
  let azureProvider: AzureProvider

  beforeEach(() => {
    azureProvider = new AzureProvider({
      connectionString: process.env.AZURE_CONNECTION_STRING!,
      containerName: process.env.AZURE_CONTAINER_NAME!,
      accountName: process.env.AZURE_ACCOUNT_NAME!,
      accountKey: process.env.AZURE_ACCOUNT_KEY!,
    })
  })

  it("should prepare a download request", async () => {
    const key = "test/download.txt"
    const { url } = await azureProvider.prepareDownload(key, 3600)
    expect(url).toContain(
      `https://${process.env.AZURE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.AZURE_CONTAINER_NAME}/${key}`
    )
  })

  it("should prepare an upload request", async () => {
    const key = "test/upload.txt"
    const { url } = await azureProvider.prepareUpload(key, 3600)
    expect(url).toContain(
      `https://${process.env.AZURE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.AZURE_CONTAINER_NAME}/${key}`
    )
  })

  it("should prepare a delete request", async () => {
    const key = "test/delete.txt"
    const { url } = await azureProvider.prepareDelete(key, 3600)
    expect(url).toContain(
      `https://${process.env.AZURE_ACCOUNT_NAME}.blob.core.windows.net/${process.env.AZURE_CONTAINER_NAME}/${key}`
    )
  })

  it("should check if a key exists", async () => {
    const key = "test/exists.txt"
    const exists = await azureProvider.exists(key)
    expect(exists).toBe(true)
  })
})
