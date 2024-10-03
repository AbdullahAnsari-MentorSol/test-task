/// <reference types="./types.d.ts" />

import eslint from "@eslint/js"
import importPlugin from "eslint-plugin-import"
import notice from "eslint-plugin-notice"
import turboPlugin from "eslint-plugin-turbo"
import tseslint from "typescript-eslint"

export const platformLicense = tseslint.config({
  files: ["**/*.js", "**/*.ts", "**/*.tsx"],
  ignores: ["**/*.d.ts"],
  plugins: {
    notice,
  },
  rules: {
    "notice/notice": [
      "error",
      {
        onNonMatchingHeader: "report",
        template: `/**
 * This file is part of the Kreios platform.
 *
 * Copyright (c) <%= YEAR %> KREIOS S.A.R.L
 * Licensed under the MIT License (Expat). You may obtain a copy of the License
 * in the LICENSE file in the root directory of this source tree.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
`,
      },
    ],
  },
})

/**
 * @param {string} client
 * @param {string} project
 */
export const createClientLicenseConfig = (client, project) =>
  tseslint.config({
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    ignores: ["**/*.d.ts"],
    plugins: {
      notice,
    },
    rules: {
      "notice/notice": [
        "error",
        {
          onNonMatchingHeader: "report",
          template: `/**
 * This file is part of the ${project} project.
 *
 * Copyright (c) <%= YEAR %> ${client}. All rights reserved.
 * This code is proprietary and belongs to ${client}.
 * Unauthorized copying, distribution, or use of this file is strictly prohibited.
 * Please refer to the LICENSE file in the root directory of this source tree for more details.
 */
`,
        },
      ],
    },
  })

/**
 * All packages that leverage t3-env should use this rule
 */
export const restrictEnvAccess = tseslint.config({
  files: ["**/*.js", "**/*.ts", "**/*.tsx"],
  rules: {
    "no-restricted-properties": [
      "error",
      {
        object: "process",
        property: "env",
        message: "Use `import { env } from '~/env'` instead to ensure validated types.",
      },
    ],
    "no-restricted-imports": [
      "error",
      {
        name: "process",
        importNames: ["env"],
        message: "Use `import { env } from '~/env'` instead to ensure validated types.",
      },
    ],
  },
})

export default tseslint.config(
  {
    // Globally ignored files
    ignores: ["**/*.config.*"],
  },
  {
    files: ["**/*.js", "**/*.ts", "**/*.tsx"],
    plugins: {
      import: importPlugin,
      turbo: turboPlugin,
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    rules: {
      ...turboPlugin.configs.recommended.rules,
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "@typescript-eslint/consistent-type-imports": [
        "warn",
        { prefer: "type-imports", fixStyle: "inline-type-imports" },
      ],
      "@typescript-eslint/no-misused-promises": [2, { checksVoidReturn: { attributes: false } }],
      "@typescript-eslint/no-unnecessary-condition": [
        "error",
        {
          allowConstantLoopConditions: true,
        },
      ],
      "@typescript-eslint/require-await": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "import/consistent-type-specifier-style": ["error", "prefer-top-level"],
    },
  },
  {
    linterOptions: { reportUnusedDisableDirectives: true },
    languageOptions: { parserOptions: { projectService: true } },
  }
)
