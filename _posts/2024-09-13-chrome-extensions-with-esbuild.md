---
title: Chrome Extensions with <code>esbuild</code>
toc: true
---

<!-- Get the assets path, removing the trailing slash -->

{% assign page_includes = page.slug | split: '/' | join: '/' %}
{% assign page_assets = page.url | prepend: '/assets' | split: '/' | join: '/' %}

I found myself with an opportunity to write a Chrome extension recently. Writing the extension turned out to be the easy part; the difficult part, it turned out, was making the process _enjoyable_.

This is how I did it.

## Part 1: A Brief Overview Of Chrome Extensions

A very, very basic Chrome extension consists of a few files:

1. A `manifest.json` file, which describes the extension to Chrome.
2. A `background.js` file, which runs in the background and can listen for events.
3. A `content.js` file, which runs in the context of the page.

You can write a Chrome extension without a `background.js` or a `content.js` file, but the `manifest.json` file is required. This is where you define the properties of the extension, like its name, version, files referenced, and permissions.

In this example I'm using Manifest V3. This post should mostly apply to Manifest V2, but the specifics may vary.

Here's a very rough example, detailing an extension that targets this very page:

{% tabs part-1 %}

{% tab part-1 `manifest.json` %}

```json
{% include_relative {{ page_includes | append: '/code/part-1-manifest.json' }} %}
```

{% endtab %}

{% tab part-1 `content.js` %}

```js
alert("Hello world!");
```

{% endtab %}

{% endtabs %}

Take those files, zip them up, and you have a Chrome extension. You can load it into Chrome by going to `chrome://extensions`, enabling Developer Mode, and loading an unpacked extension pointed at the directory containing the `manifest.json` file.

It doesn't do much, but we can fix that.

If we update the `content.js` file to the following:

```js
document.body.style.background = "red";
```

And reload the page...

Nothing happens.

This is because Chrome extensions, once loaded, are cached. You need to reload the extension to see changes, which involves either installing _another_ extension and reloading the page, or manually going to `chrome://extensions` and reloading the extension.

That's not that much fun.

## Part 2: Making It Fun

Okay, first things first: writing raw JavaScript is a pain. I don't want to write raw JavaScript. I want to write TypeScript.

So let's do that. We can start up a proper NPM project, install `typescript`, and rename `content.js` to `content.ts`.

```bash
npm init -y
npm install --save-dev typescript
tsc --init
mkdir -p src
mv manifest.json src/manifest.json
mv content.js src/content.ts
```

{% details And for good measure... %}

These aren't necessary, but they're nice to have.

```bash
# add linting
npm init @eslint/config
npx npm-add-script -k "lint" -v "npx tsc -noEmit; npx eslint src",
npx npm-add-script -k "lint:fix" -v "npm run lint -- --fix",

# add formatting
npm install --save-dev prettier eslint-config-prettier eslint-plugin-prettier

# add a combined format and lint script, and run it on commit
npm install --save-dev husky
npx husky init
echo "npm run lint:fix" > .husky/pre-commit
```

{% tabs part-2 %}

{% tab part-2 `eslint.config.mjs` %}

```js
import pluginJs from "@eslint/js";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
];
```

{% endtab %}

{% endtabs %}

{% enddetails %}

Now we can write TypeScript, and then compile it into JavaScript for the extension:

```bash
tsc src/content.ts --outDir dist
```

Fun. But we can do better. For one, we likely don't want to keep all of our code in a single file. And while we can certainly compile with `tsc`, it's difficult to hook into it to make other things happen when a build is kicked off.

We need a build tool. Enter `esbuild`.

## Part 3: `esbuild`

You can read more about `esbuild` [here](https://esbuild.github.io/), but the gist is that it's a fast, modern JavaScript bundler. And I wanted to try something new.

```bash
npm i --save-dev esbuild
esbuild src/content.ts --bundle --outdir=dist
```

Nice. And, we can even watch for changes:

```bash
esbuild src/content.ts --bundle --outdir=dist --watch
```

Although - while this is starting to feel like a proper setup, we're still not at the point where we have a good feedback loop. We still need to manually reload the extension to see changes.

Let's see if we can fix that.

## Part 4: `esbuild` Plugins

First off: let's write an easy one. That `manifest.json` file, it looks a lot like our `package.json` file: a `name`, a `description`, and a `version`. I dislike having that sort of information copied in multiple places, so let's figure out a way to change that.

First, instead of using `esbuild` from the command line, we want to write a script. This will give us a lot more flexibility. We'll do it in Typescript, so remember to install either `ts-node` or `tsx`. We're going to use `tsx` here.

```bash
npm install --save-dev tsx
```

{% tabs part-4a %}

{% tab part-4a `esbuild/index.ts` %}

```ts
{% include_relative {{ page_includes | append: '/code/part-4a-esbuild.ts' }} %}
```

{% endtab %}

{% endtabs %}

Now we can run `tsx esbuild/index.ts` to build our extension. But... we lost the ability to watch for changes. Let's fix that.

```bash
npm install --save-dev minimist
```

{% tabs part-4b %}

{% tab part-4b `esbuild/index.ts` %}

```ts
{% include_relative {{ page_includes | append: '/code/part-4b-esbuild.ts' }} %}
```

{% endtab %}

{% endtabs %}

A bit of re-inventing the wheel here, but we'll get the benefit of a lot more flexibility. Now we can run `tsx esbuild/index.ts --watch` to watch for changes, too.

But there's something weird happening. Our `manifest.json` is getting turned into a JavaScript file. This is because by default, JSON uses the `json` loader, which makes the content accessibile to our scripts. That's not actually what we're after in this case - we kind of want `esbuild` to leave it alone, and just inject the file into the output directory.

We can solve that with our plugin:

{% tabs part-4c %}

{% tab part-4c `esbuild/plugins/manifestPlugin.ts` %}

```ts
{% include_relative {{ page_includes | append: '/code/part-4c-manifestPlugin.ts' }} %}
```

{% endtab %}

{% tab part-4c `esbuild/index.ts` %}

```ts
{% include_relative {{ page_includes | append: '/code/part-4c-esbuild.ts' }} %}
```

{% endtab %}

{% endtabs %}

Let's go over what we've done here.

1. We've created a new plugin that, when `esbuild` attempts to load the file `manifest.json`, reads the file, merges it with the `package.json` file, and then returns the result as a string.
2. We've also updated the `loader` used to `copy`, which tells `esbuild` to just copy the file to the output directory, rather than processing it as a JavaScript file.

Now we can run `tsx esbuild/index.ts` and see our changes reflected in the output directory.

Now that we've got a good understanding of how to build a plugin, let's tackle the big issue at hand.

## Part 5: Auto Reload

Our requirements are simple: when `esbuild` has a new version of the extension for us, we want to reload the extension in Chrome.

There are a couple of other tools that we could use to do this, but we're already in "do it ourselves" mode and I don't see a reason to stop now. Let's get into it.

### Part 5a: The Server

Most tools like this use a WebSocket connection to communicate between the code running in the browser and the build server. That seems like a good enough solution for us, too.

Install `ws`:

```bash
npm install --save-dev ws
```

And then get to work:

{% tabs part-5a %}

{% tab part-5a `esbuild/plugins/manifestPlugin.ts` %}

```ts
{% include_relative {{ page_includes | append: '/code/part-5a-extReloadPlugin.ts' }} %}
```

{% endtab %}

{% tab part-5a `esbuild/index.ts` %}

```ts
{% include_relative {{ page_includes | append: '/code/part-5a-esbuild.ts' }} %}
```

{% endtab %}

{% endtabs %}

This is a lot, but we can parse it out into a few key pieces:

1. We've added a new plugin, `extReloadPlugin`, that sets up a WebSocket server on port 8080. When the build is being setup, it creates a new WebSocket server.
2. Then, we register a couple of event listeners on the WebSocket server, listening for when our client connects. These aren't crucial, but they help with debugging.
3. Then, we hook into the `build.onEnd` event, which `esbuild` fires off every time the build finishes. When this happens, we broadcast a message to all connected clients that the extension should be reloaded.
4. Lastly, we update our build options so that we only bother to use this plugin when we're watching for changes.

### Part 5b: The Extension

Now for the extension side. There are two main things we need to do here:

1. We need to connect to the WebSocket server.
2. We need to listen for messages from the server, and then when we receive a message, we need to:
   1. Reload the extension,
   2. Reload the page, so that the updated code can run.

We've got two places that need that WebSocket connection, so we'll create a function to make that easier and then update our two scripts to use it. We'll also need to update the permissions of our extension, too: you need the `management` permission to reload the extension.

{% tabs part-5b %}

{% tab part-5b `src/utils/websocket.ts` %}

```ts
{% include_relative {{ page_includes | append: '/code/part-5b-websocket.ts' }} %}
```

{% endtab %}

{% tab part-5b `src/background.ts` %}

```ts
{% include_relative {{ page_includes | append: '/code/part-5b-background.ts' }} %}
```

{% endtab %}

{% tab part-5b `src/content.ts` %}

```ts
{% include_relative {{ page_includes | append: '/code/part-5b-content.ts' }} %}
```

{% endtab %}

{% tab part-5b `src/manifest.json` %}

```json
{% include_relative {{ page_includes | append: '/code/part-5b-manifest.json' }} %}
```

{% endtab %}

{% endtabs %}

## Final Code

All of the snippets above are stored as separate files [here](https://github.com/salockhart/salockhart.github.io/blob/main/_posts/chrome-extensions-with-esbuild/code), named according to the part they belong to.

## Future Work

This is a good start, but there's _a lot_ we could improve on.

1. This isn't terribly resilient. When our server goes down, for instance, the extension will lose its connection and never try again. It would be nice if the extension could try to reconnect, possibly with some backoff.
2. We're setting up two listeners here, which could introduce some race conditions. We only want to refresh our page _after_ the extensions have been reloaded. It would be nice if we could consolidate these into a single listener, and use events between the ServiceWorker and the content script to communicate.
3. We have a hard-coded WebSocket port here. It would be nice if this was more configurable, or more dynamic, where the plugin could find an open port to use and then inject that port into the extension code.
4. Currently, the auto reload code needs to be manually added to our `content.ts` and `background.ts` files. It would be nice if this was more automatic, where the plugin could inject the necessary code into the output files. However, this doesn't seem to be possible with `esbuild` at the moment. It can inject code into _every_ file, but not selectively.

Overall: `esbuild` is neat. This was fun. I hope you have fun too.
