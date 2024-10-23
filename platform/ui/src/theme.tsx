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

"use client"

import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { ThemeProvider, useTheme } from "next-themes"

import { Button } from "./button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  // Toggle function
  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <Button size="icon" variant="ghost" onClick={toggleTheme}>
      <SunIcon className="hidden h-[1.2rem] w-[1.2rem] dark:block" />
      <MoonIcon className="h-[1.2rem] w-[1.2rem] dark:hidden" />

      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

export { ThemeProvider }
