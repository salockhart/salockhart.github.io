---
title: Chrome Extensions with <code>esbuild</code>
toc: true
---

I found myself with an opportunity to write a Chrome extension recently. Writing the extension turned out to be the easy part; the difficult part, it turned out, was making the process _enjoyable_.

This is how I did it.

## Part 1: A Brief Overview Of Chrome Extensions

A very, very basic Chrome extension consists of a few files:

1. A `manifest.json` file, which describes the extension to Chrome.
2. A `background.js` file, which runs in the background and can listen for events.
3. A `content.js` file, which runs in the context of the page.

You can write a Chrome extension without a `background.js` or a `content.js` file, but the `manifest.json` file is required. This is where you define the properties of the extension, like its name, version, files referenced, and permissions.

In this example I'm using Manifest V3. Roughly the same should apply to Manifest V2, but the specifics may vary.

Here's a very rough example, detailing an extension that targets this very page:

`manifest.json`

```json
{
  "manifest_version": 3,
  "name": "example-extension",
  "version": "0.1.0",
  "description": "An example extension",
  "content_scripts": [
    {
      "js": ["content.js"],
      "matches": [
        "https://lockhart.dev/2024/09/07/chrome-extensions-with-esbuild/"
      ]
    }
  ]
}
```

`content.js`

```js
alert("Hello world!");
```

Take those files, zip them up, and you have a Chrome extension. You can load it into Chrome by going to `chrome://extensions`, enabling Developer Mode, and loading an unpacked extension pointed at the directory containing the `manifest.json` file.

Now you've got a Chrome extension. It doesn't do much, but we can fix that.

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

{% details And for good measure %}

These aren't necessary, but they're nice to have.

```bash
# add linting
npm init @eslint/config
npx npm-add-script -k "lint" -v "npx eslint src",
npx npm-add-script -k "lint:fix" -v "npm run lint -- --fix",

# add formatting
npm install --save-dev prettier
npm install --save-dev eslint-config-prettier
npx npm-add-script -k "prettier" -v "npx prettier src --check",
npx npm-add-script -k "prettier:fix" -v "npm run prettier -- --write",

# add a combined format and lint script, and run it on commit
npx npm-add-script -k "format" -v "npm run prettier:fix && npm run lint:fix"
npm install --save-dev husky
npx husky init
echo "npm run format" > .husky/pre-commit
```

(Remember to add `prettier` to `eslint.config.mjs`.)

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

First, instead of using `esbuild` from the command line, we want to write a script. This will give us a lot more flexibility.

`esbuild.mjs`

```js
import * as esbuild from "esbuild";

esbuild.build({
  entryPoints: ["src/content.ts", "src/manifest.json"],
  bundle: true,
  outdir: "dist",
  logLevel: "info",
});
```

Now we can run `node esbuild.mjs` to build our extension. But... we lost the ability to watch for changes. Let's fix that.

```bash
npm install --save-dev minimist
```

`esbuild.mjs`

```js
import * as esbuild from "esbuild";
import minimist from "minimist";

const buildOptions = ({ debug }) => ({
  entryPoints: ["src/content.ts", "src/manifest.json"],
  bundle: true,
  minify: !debug,
  sourcemap: debug,
  outdir: "dist",
  logLevel: "info",
});

async function watch() {
  const ctx = await esbuild.context(buildOptions({ debug: true }));
  await ctx.watch();
}

async function build() {
  await esbuild.build(buildOptions({ debug: false }));
}

const argv = minimist(process.argv.slice(2));
if (argv.watch) {
  watch();
} else {
  build();
}
```

A bit of re-inventing the wheel here, but we'll get the benefit of a lot more flexibility. Now we can run `node esbuild.mjs --watch` to watch for changes, too.

But there's something weird happening. Our `manifest.json` is getting turned into a JavaScript file. This is because by default, JSON uses the `json` loader, which makes the content accessibile to our scripts. That's not actually what we're after in this case - we kind of want `esbuild` to leave it alone, and just inject the file into the output directory.

We can solve that with our plugin:

`esbuild.mjs`

```js
import * as fs from "node:fs/promises";
import packageJson from "./package.json" with { type: "json" };

const manifestPlugin = () => ({
  name: "manifest",
  setup(build) {
    build.onLoad({ filter: /manifest\.json$/ }, async (args) => {
      const content = JSON.parse(await fs.readFile(args.path, "utf8"));
      const updatedManifest = Object.entries(content)
        .map(([key, value]) => [
          key,
          key in packageJson ? packageJson[key] : value,
        ])
        .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

      return {
        contents: JSON.stringify(updatedManifest),
        loader: "copy",
      };
    });
  },
});

const buildOptions = ({ debug }) => ({
    ...
    plugins: [manifestPlugin()],
});
```

I'll share the final version of the `esbuild.mjs` file at the end of this post. But let's go over what we've done here.

1. We've imported the `fs` module from Node.js, so we can read the manifest file we are given, and then we have imported the `package.json` file.
2. We've created a new plugin that, when `esbuild` attempts to load the file `manifest.json`, reads the file, merges it with the `package.json` file, and then returns the result as a string.
3. We've also updated the `loader` used to `copy`, which tells `esbuild` to just copy the file to the output directory, rather than processing it as a JavaScript file.

Now we can run `node esbuild.mjs` and see our changes reflected in the output directory.

Now that we've got a good understanding of how to build a plugin, let's tackle the big issue at hand.

## Part 5: Auto Reload

Our requirements are simple: when `esbuild` has a new version of the extension for us, we want to reload the extension in Chrome.

There are a couple of other tools that we could use to do this, but we're already in "do it ourselves" mode and I don't see a reason to stop now. Let's get into it.

### Part 5a: The Server

First, a design. Most tools like this use a WebSocket connection to communicate between the code running in the browser and the build server. That seems like a good enough solution for us, too.

Second, install `ws`:

```bash
npm install --save-dev ws
```

And then get to work:

`esbuild.mjs`

```js
import { WebSocketServer } from "ws";

const extReloadPlugin = () => ({
  name: "ext-reload",
  setup(build) {
    console.log("[ext-reload] setting up plugin");
    const port = 8080;
    const wss = new WebSocketServer({ port });

    wss.on("listening", () =>
      console.log(`[ext-reload] websocket server listening on port ${port}`)
    );

    wss.on("connection", (ws) => {
      console.log("[ext-reload] client connected");
      ws.send(JSON.stringify({ type: "up" }));
      ws.on("error", (err) => console.error("[ext-reload]", err));
      ws.on("close", () => console.log("[ext-reload] client disconnected"));
    });

    const broadcast = (data) => {
      console.log("[ext-reload] broadcasting", data);
      wss.clients.forEach((ws) => {
        // OPEN = 1
        if (ws.readyState !== 1) return;
        console.log("[ext-reload] sending to client");
        ws.send(JSON.stringify(data), (err) => {
          if (err) console.error("[ext-reload] failed to send:", err);
        });
      });
    };

    build.onEnd(() => {
      console.log("[ext-reload] reloading extension");
      broadcast({ type: "reload" });
    });
  },
});

const buildOptions = ({ debug, plugins }) => ({
    ...
    plugins: [manifestPlugin(), ...(plugins || [])],
});

async function watch() {
  const ctx = await esbuild.context(
    buildOptions({ debug: true, plugins: [extReloadPlugin()] })
  );
  await ctx.watch();
}
```

This is a lot, but we can parse it out into a few key pieces:

1. We've added a new plugin, `extReloadPlugin`, that sets up a WebSocket server on port 8080. When the build is being setup, it creates a new WebSocket server.
2. Then, we register a couple of listeners on the WebSocket server, listening for when our client connects. These aren't crucial, but they help with debugging.
3. Then, we hook into the `build.onEnd` event, which `esbuild` fires off every time the build finishes. When this happens, we broadcast a message to all connected clients that the extension should be reloaded.
4. Lastly, we update our build options so that we only bother to use this plugin when we're watching for changes.

### Part 5b: The Extension

Now for the extension side. There are two main things we need to do here:

1. We need to connect to the WebSocket server.
2. We need to listen for messages from the server, and then when we receive a message, we need to:
   1. Reload the extension
   2. Reload the page, so that the updated code can run

Let's start with the first part. We need a new function that will let us connect to the WebSocket server:

`src/utils/websocket.ts`

```ts
interface Props {
  onReload?: () => void;
}

export const registerReloadWebsocket = ({ onReload }: Props) => {
  const socket = new WebSocket("ws://localhost:8080");
  socket.addEventListener("message", (event) => {
    const payload = JSON.parse(event.data);
    console.log("[ext-reload] received message", payload);

    switch (payload.type) {
      case "reload":
        console.log("[ext-reload] extension updated, reloading...");
        onReload?.();
        break;
    }
  });
};
```

Then, we need to use it to reload the extension. We can only do this from a ServiceWorker, which means we need to update our `manifest.json` file:

`src/manifest.json`

```json
{
  ...
  "background": {
    "service_worker": "background.js"
  },
  "permissions": ["management"],
}
```

`src/background.ts`

```ts
import { registerReloadWebsocket } from "./utils/websocket";

addEventListener("activate", () => {
  console.log("[ext-reload] background script loaded");
  registerReloadWebsocket({
    onReload: () => {
      chrome.runtime.reload();
    },
  });
});
```

Be sure to add this to our `esbuild.mjs` entrypoints, too.

And finally, to refresh the page:

```ts
import { registerReloadWebsocket } from "./utils/websocket";

registerReloadWebsocket({
  onReload: () => {
    window.location.reload();
  },
});
```

And that's it! Now, when we run `node esbuild.mjs --watch`, our extension will automatically reload when we make changes to the code.

## Future Work

This is a good start, but there's a lot we could improve on.

1. This isn't terribly resilient. When our server goes down, for instance, the extension will lose its connection and never try again. It would be nice if the extension could try to reconnect, possibly with some backoff.
2. We're setting up two listeners here, which could introduce some race conditions. We only want to refresh our page _after_ the extensions have been reloaded. It would be nice if we could consolidate these into a single listener, and use events between the ServiceWorker and the content script to communicate.
3. We have a hard-coded port here. It would be nice if this was more configurable, or more dynamic, where the plugin could find an open port to use and then inject that port into the extension code.
4. Currently, the auto reload code needs to be manually added to our `content.ts` and `background.ts` files. It would be nice if this was more automatic, where the plugin could inject the necessary code into the output files.
5. And lastly - I should probably bundle all of this up into a package. It would be nice if this was more easily consumable.
