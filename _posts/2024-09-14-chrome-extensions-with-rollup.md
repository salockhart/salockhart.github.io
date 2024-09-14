---
title: Chrome Extensions with <code>rollup</code>
toc: true
---

<!-- Get the assets path, removing the trailing slash -->

{% assign page_includes = page.slug | split: '/' | join: '/' %}
{% assign page_assets = page.url | prepend: '/assets' | split: '/' | join: '/' %}

Yesterday I posted about using `esbuild` to bundle a Chrome extension. I hit some roadblocks with that approached, and figured I had gone far enough to warrant a different approach. I decided to try `rollup` instead.

This is how I did it.

## Part 1: Rollup

If you are starting from the previous post:

```bash
npm uninstall esbuild minimist tsx ws
```

Then install the necessary packages and scripts:

```bash
npm install rollup \
    rollup-plugin-chrome-extension \
    @rollup/plugin-typescript \
    @rollup/plugin-node-resolve \
    @rollup/plugin-commonjs --save-dev

npx npm-add-script -f -k "build" -v "rollup -c"
npx npm-add-script -f -k "watch" -v "rollup -c -w"
```

Then, the magic:

{% tabs files %}

{% tab files `rollup.config.mjs` %}

```js
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import fs from "node:fs/promises";
import {
  chromeExtension,
  simpleReloader,
} from "rollup-plugin-chrome-extension";

export default {
  input: "src/manifest.json",
  output: {
    dir: "dist",
    format: "esm",
  },
  plugins: [
    {
      // from https://github.com/jacksteamdev/rollup-plugin-empty-dir - it doesn't like Rollup 4
      name: "empty-dir",
      async generateBundle({ dir }) {
        if (dir) {
          try {
            await fs.rm(dir, { recursive: true });
          } catch {
            /* empty */
          }
        }
      },
    },
    chromeExtension(),
    simpleReloader(),
    typescript(),
    resolve(),
    commonjs(),
  ],
};
```

{% endtab %}

{% tab files `src/manifest.json` %}

```json
{
  "manifest_version": 3,
  "background": {
    "service_worker": "background.ts",
    "type": "module"
  },
  "content_scripts": [
    {
      "js": ["content.ts"],
      "matches": ["https://www.dndbeyond.com/*"]
    }
  ],
  "permissions": ["storage"]
}
```

{% endtab %}

{% endtabs %}

Pretty wild. With a single Rollup plugin, we can do everything we were doing manually in `esbuild` and more. (Not to say that there isn't a plugin for `esbuild`, but I didn't find it. I may not have looked hard enough.)

Better yet, everything is then driven off of our `manifest.json` file. Typescript files in the Manifest! Amazing.

This isn't a great education about working with Rollup directly, but it's certainly fun to see the breadth of the community around the tool. And, this brief comparison shows why tools like Vite [use both](https://vitejs.dev/guide/why.html) - they each have their strengths.
