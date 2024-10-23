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

import tinycolor from "tinycolor2"

export const colorIsDark = (color: string) => tinycolor(color).isDark()

export const getContrastColor = (color: string, format: "word" | "rgb" | "hsl" = "word") => {
  const tinyColor = tinycolor(color)
  const isDark = tinyColor.isDark()
  switch (format) {
    case "word":
      return isDark ? "white" : "black"
    case "rgb":
      return isDark ? "#ffffff" : "#000000"
    case "hsl":
      return isDark ? "0 0% 100%" : "0 0% 0%"
  }
}
