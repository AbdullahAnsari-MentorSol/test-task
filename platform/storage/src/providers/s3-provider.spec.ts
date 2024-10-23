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

import { S3Provider } from "./s3-provider"

const shouldRunTests =
  process.env.AWS_ACCESS_KEY_ID &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_REGION &&
  process.env.AWS_S3_BUCKET

describe.runIf(shouldRunTests)("S3Provider", () => {
  let s3Provider: S3Provider

  beforeEach(() => {
    s3Provider = new S3Provider({
      region: process.env.AWS_REGION!,
      bucket: process.env.AWS_S3_BUCKET!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    })
  })

  it("should prepare a download request", async () => {
    const key = "test/download.txt"
    const { url } = await s3Provider.prepareDownload(key, 3600)
    expect(url).toContain(`https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`)
  })

  it("should prepare an upload request", async () => {
    const key = "test/upload.txt"
    const { url } = await s3Provider.prepareUpload(key, 3600)
    expect(url).toContain(`https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`)
  })

  it("should prepare a delete request", async () => {
    const key = "test/delete.txt"
    const { url } = await s3Provider.prepareDelete(key, 3600)
    expect(url).toContain(`https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`)
  })

  it("should check if a key exists", async () => {
    const key = "test/exists.txt"
    const exists = await s3Provider.exists(key)
    expect(exists).toBe(true)
  })
})
