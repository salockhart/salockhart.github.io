---
title: Building a Chrome Extension for D&DBeyond
reveal:
  totalTime: 300
---

<!-- Get the assets path, removing the trailing slash -->

{% assign page_includes = page.slug | split: '/' | join: '/' %}
{% assign page_assets = page.url | prepend: '/assets' | split: '/' | join: '/' %}

<section data-markdown>
<textarea data-template>

## Building a Chrome Extension for D&DBeyond

Alex Lockhart

---

Hey, meet our friend Phoenix!

Phoenix knows a lot of spells. And Phoenix is about to know a lot more.

<img src="{{ page_assets }}/img/phoenix.png" style="width: 400px" />

---

## September

Wizards of the Coast releases the 2024 revision of the Dungeons & Dragons 5th Edition Player's Handbook.

Notes:

This revision changed a lot of things, including the spell list. And like any breaking change, there was the need to introduce some versioning.

---

<!-- .slide: data-auto-animate -->

<div class="two-col">
  <div>
    We went from this:
    <img src="{{ page_assets }}/img/spells-before.png" />
  </div>
  <div>
    To this:
    <img src="{{ page_assets }}/img/spells-after.png" />
  </div>
</div>

---

<!-- .slide: data-auto-animate -->

But Phoenix doesn't use the 2024 rules.

I can't use these.

<img src="{{ page_assets }}/img/spells-after.png" />

<div style="width: 100%; position: absolute; top: 310px;">
  <div style="width: 100%; height: 20px; background-color: red; position: relative; top: 16px;"></div>
  <div style="width: 100%; height: 20px; background-color: red; position: relative; top: 187px;"></div>
  <div style="width: 100%; height: 20px; background-color: red; position: relative; top: 359px;"></div>
  <div style="width: 100%; height: 20px; background-color: red; position: relative; top: 435px;"></div>
  <div style="width: 100%; height: 20px; background-color: red; position: relative; top: 511px;"></div>
  <div style="width: 100%; height: 20px; background-color: red; position: relative; top: 683px;"></div>
  <div style="width: 100%; height: 20px; background-color: red; position: relative; top: 759px;"></div>
  <div style="width: 100%; height: 20px; background-color: red; position: relative; top: 835px;"></div>
  <div style="width: 100%; height: 20px; background-color: red; position: relative; top: 1007px;"></div>
  <div style="width: 100%; height: 20px; background-color: red; position: relative; top: 1179px;"></div>
</div>

---

Chrome extension time!

---

Let's get things setup.

```bash
npm init -y
npm install --save-dev \
  @rollup/plugin-commonjs \
  @rollup/plugin-node-resolve \
  @rollup/plugin-typescript \
  @types/chrome \
  @types/node \
  rollup \
  rollup-plugin-chrome-extension \
  typescript
```

Notes:

We need to init a new npm project and install some dependencies.

The main things here are `rollup` and the plugins for it. Typescript is optional, but I like to use it.

---

`rollup.config.mjs`

```js [|30]
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
      // from https://github.com/jacksteamdev/rollup-plugin-empty-dir
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

Notes:

We need to create a `rollup.config.mjs` file. Funnily, this and the next file handle pretty much everything for us.

The secret is the `rollup-plugin-chrome-extension` package. We'll see in a moment.

---

`src/manifest.json`

```json [|5-8]
{
  "manifest_version": 3,
  "name": "Beyond Legacy",
  "content_scripts": [
    {
      "js": ["content.ts"],
      "matches": ["https://www.dndbeyond.com/*"]
    }
  ],
  "icons": {
    "16": "img/icon16.png",
    "48": "img/icon48.png",
    "128": "img/icon128.png"
  }
}
```

Notes:

We create the manifest for our extension. Keen eyes will notice that this is a "Manifest V3" extension.

Our needs are pretty simple. We give it a name, and tell it to run our `content.ts` file on the D&DBeyond site.

---

`src/content.ts`

```ts []
function bootstrap() {
  document
    .querySelectorAll<HTMLElement>(`details[class*="styles_spell"]`)
    .forEach((el) => {
      el.remove();
    });
}

bootstrap();
```

Notes:

Here's my first attempt. When the page loads, the extension will run, and _hopefully_ remove all the spells. I figure this is a good start.

---

Except nothing happens.

<img src="{{ page_assets }}/img/spells-after.png" />

---

`MutationObserver`

Notes:

This was the first major thing I learned doing this. SPAs are tricky!

That extension is going to run as soon as the page finishes loading, but the content I'm looking for isn't even in the DOM yet.

---

Enter our new favourite friend, MutationObserver.

```ts []
function bootstrap() {
  const observer = new window.MutationObserver(() => {
    document
      .querySelectorAll<HTMLElement>(`details[class*="styles_spell"]`)
      .forEach((el) => {
        el.remove();
      });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

bootstrap();
```

Notes:

Our script is pretty much the same, but we're wrapping it in a `MutationObserver` object and then registering it on the body of the page.

The goal is that if the `body` changes, or any of its children change, we run our function.

---

And now it works! A bit too well, actually.

So well that it's hard to share a screenshot, because it removes everything.

---

So let's limit it to just spells that aren't marked as Legacy.

```ts [|6]
function bootstrap() {
  const observer = new window.MutationObserver(() => {
    document
      .querySelectorAll<HTMLElement>(`details[class*="styles_spell"]`)
      .forEach((el) => {
        if (!el.querySelector(`span[data-tooltip-id*="legacybadge_"]`)) {
          el.remove();
        }
      });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

bootstrap();
```

Notes:

Specifically this bit - we'll only remove the spell if it doesn't have a "Legacy" badge.

---

Success ✅

<img src="{{ page_assets }}/img/spells-after-script.png" />

---

Until you try to filter by spell level.

<img src="{{ page_assets }}/img/ddb-error.png" />

---

Okay, fine. A light touch.

```ts [7]
function bootstrap() {
  const observer = new window.MutationObserver(() => {
    document
      .querySelectorAll<HTMLElement>(`details[class*="styles_spell"]`)
      .forEach((el) => {
        if (!el.querySelector(`span[data-tooltip-id*="legacybadge_"]`)) {
          el.style.display = "none";
        }
      });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

bootstrap();
```

---

Success ✅

<img src="{{ page_assets }}/img/spells-filtered.png" />

---

Tests?

```bash
npm init playwright@latest
```

Notes:

According to the Playwright docs, they have good support for Chrome extensions. Let's give it a try.

---

Setup a basic test to just get started...

```ts
import { expect, test } from "@playwright/test";

test("can load the homepage", async ({ page }) => {
  await page.goto("https://www.dndbeyond.com/");
  await expect(page).toHaveScreenshot("homepage.png");
});
```

---

<img src="{{ page_assets }}/img/ddb-bot.png" />

---

Success ✅

```
npm uninstall @playwright/test
```

---

## March

Wizards of the Coast lets you filter for different categories of spells.

<img src="{{ page_assets }}/img/ddb-filters.png" />

Notes:

Now if you were paying attention, you might have noticed something in the screenshot from before.

They went ahead and added a filter. Huh.

---

Success ✅

```
rm -rf .
```

Notes:

Well, they say the best code is no code.

---

## Thank you!

<div class="two-col place-center">
  <div class="one-col place-center">
    <p>Alex Lockhart</p>
    <img src="/assets/profile.jpg" alt="a photo of the author" style="width: 200px" />
  </div>
  <div class="one-col place-center" style="width: 100%">
    <a href="https://lockhart.dev">lockhart.dev</a>
    <div data-qr-code="{% post_url 2025-05-01-building-a-chrome-extension-for-dndbeyond %}" />
  </div>
</div>

</textarea>
</section>
