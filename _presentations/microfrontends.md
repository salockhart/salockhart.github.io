---
title: Micro Frontends
---

<!-- Get the assets path, removing the trailing slash -->

{% assign page_assets = page.url | prepend: '/assets' | split: '/' | join: '/' %}

<style>
  .image-container {
    height: 100%;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    place-items: center;
  }
</style>

<section data-markdown>
<textarea data-template>

## Micro Frontends

Alex Lockhart

---

<!-- .slide: data-auto-animate -->

## The Problem

<div class="image-container">
  <img src="{{ page_assets }}/web-app-monolith.png" style="width: 40%; justify-self: end;" />
  <div class="r-stack" style="padding: 100px">
    <img src="{{ page_assets }}/arrow.png" />
    <img src="{{ page_assets }}/arrow.png" />
    <img src="{{ page_assets }}/arrow.png" />
    <img src="{{ page_assets }}/arrow.png" />
    <img src="{{ page_assets }}/arrow.png" />
    <img src="{{ page_assets }}/arrow.png" />
    <img src="{{ page_assets }}/arrow.png" />
    <img src="{{ page_assets }}/arrow.png" />
    <img src="{{ page_assets }}/arrow.png" />
  </div>
  <img src="{{ page_assets }}/server-monolith.png" style="width: 40%; justify-self: start;" />
</div>

Notes:

- The classic client-server relationship. Our business sells shapes!
- Our users go to our website, our app loads, and they do things that talk to the server.
- Business is going well. So well, in fact, that our application keeps growing.

---

<!-- .slide: data-auto-animate -->

## The Problem

<style>
  .many-arrow {
    width: 40%;
    position: relative; 
  }
</style>

<div class="image-container">
  <img src="{{ page_assets }}/web-app-monolith.png" />
  <div class="r-stack" style="padding: 40px">
    <img src="{{ page_assets }}/arrow.png" class="many-arrow" style="top: -20px; left: -15px" />
    <img src="{{ page_assets }}/arrow.png" class="many-arrow" style="top: 40px; left: -10px" />
    <img src="{{ page_assets }}/arrow.png" class="many-arrow" style="top: 60px; left: 0px" />
    <img src="{{ page_assets }}/arrow.png" class="many-arrow" style="top: -40px; left: 10px" />
    <img src="{{ page_assets }}/arrow.png" class="many-arrow" style="top: -80px; left: 5px" />
    <img src="{{ page_assets }}/arrow.png" class="many-arrow" style="top: 80px; left: -20px" /> 
    <img src="{{ page_assets }}/arrow.png" class="many-arrow" style="top: 0px; left: 15px" />
    <img src="{{ page_assets }}/arrow.png" class="many-arrow" style="top: 20px; left: -5px" />
    <img src="{{ page_assets }}/arrow.png" class="many-arrow" style="top: -60px; left: 20px" />
  </div>
  <img src="{{ page_assets }}/server-monolith.png" />
</div>

Notes:

- And GROWING.

---

## Why is this a problem?

- Lots of commits to the same code <!-- .element: class="fragment" -->
- Longer build times <!-- .element: class="fragment" -->
- Longer load times <!-- .element: class="fragment" -->

Notes:

- Well, bigger applications probably have more developers all working on the same codebase.
- Bigger applications also mean longer build times, both locally and in your CI pipeline.
- When your application takes an hour to build… you have a problem.

---

<style>
  .microservices.image-container {
    grid-template-columns: repeat(3, 1fr) 2fr;
  }
  .microservices.image-container img {
    width: 50%;
  }
  .microservices.image-container .inner {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    place-items: center;
  }
</style>

<div class="microservices image-container">
  <img src="{{ page_assets }}/web-app-monolith.png" />
  <img src="{{ page_assets }}/arrow.png" />
  <img src="{{ page_assets }}/server-blank.png" />
  <div class="inner">
    <img src="{{ page_assets }}/arrow.png" style="position: relative; top: 80px; rotate: -30deg;" />
    <img src="{{ page_assets }}/server-green.png" />
    <img src="{{ page_assets }}/arrow.png" style="position: relative; top: 20px; rotate: -15deg" />
    <img src="{{ page_assets }}/server-yellow.png" />
    <img src="{{ page_assets }}/arrow.png" style="position: relative; bottom: 20px; rotate: 15deg" />
    <img src="{{ page_assets }}/server-red.png" />
    <img src="{{ page_assets }}/arrow.png" style="position: relative; bottom: 80px; rotate: 30deg" />
    <img src="{{ page_assets }}/server-blue.png" />
  </div>
</div>

Notes:

- We have ways of solving this on the backend. We can start splitting up our servers into a classic microservice architecture.
- Instead of a monolith that handles EVERYTHING, we have an entrypoint and a bunch of smaller microservices that handle specific slices of our business.
- This lets our development teams each focus on one or more individual microservices - no more giant merge conflicts because you’re in the same codebase of 100 other people.
- These microservices are also much faster to build and deploy - instead of waiting an hour for our monolith, it might take only 10 minutes for our microservice to deploy.
- And most importantly - if we do it right, our users will never be able to tell the difference.
- That’s great for our backend - but what about our web app?

---

<!-- .slide: data-auto-animate -->

<div class="r-stack">
  <img src="{{ page_assets }}/web-app-blank.png" />
  <img src="{{ page_assets }}/web-app-green.png" style="position: relative; bottom: 60px; right: 95px;" />
  <img src="{{ page_assets }}/web-app-yellow.png" style="position: relative; right: 48px; top: 50px;" />
  <img src="{{ page_assets }}/web-app-red-blue.png" style="position: relative; left: 85px;" />
</div>

Notes:

- Well, what if we sliced it up?

---

<!-- .slide: data-auto-animate -->

<div class="r-stack">
  <img src="{{ page_assets }}/web-app-blank.png" />
  <img src="{{ page_assets }}/web-app-green.png" style="position: relative; bottom: 100px; right: 300px;" />
  <img src="{{ page_assets }}/web-app-yellow.png" style="position: relative; right: 300px; top: 50px;" />
  <img src="{{ page_assets }}/web-app-red-blue.png" style="position: relative; left: 300px;" />
</div>

## Micro Frontends <!-- .element: class="fragment" -->

## MFEs <!-- .element: class="fragment" style="text-transform: initial" -->

Notes:

- Instead of a single monolith web application, we could break this up into multiple small ones
- Each small web app could then handle it's own things, and we'd stitch them together to make a single consistent experience
- (next)
- We could even call them.... **Micro Frontends**
- (next)
- Or for short, MFEs

---

## Goals

1. It should feel like one application <!-- .element: class="fragment" -->
2. It should be performant <!-- .element: class="fragment" -->
3. It should have a great development experience <!-- .element: class="fragment" -->

Notes:

- Before we go any further, let's set our sights on some goals.
- We want this to be a step forward, not a step back.
  - (next)
  - We had one application, and we want it to keep feeling like that.
    - Just like how our microservices feel like one API!
  - (next)
  - We don't want a performance hit for this.
    - Our users don't want a worse experience just so we can try fun things!
  - (next)
  - We want to keep our developer experience good.
    - Otherwise, what's the point!

---

<div style="display: grid; grid-template-columns: repeat(3, 1fr); place-items: center;">
  <img src="{{ page_assets }}/web-app-split.png" />
  <h2>Vs.</h2>
  <img src="{{ page_assets }}/web-app-iframe.png" />
</div>

- Doesn't work exactly as "one web app." <!-- .element: class="fragment" -->
- We end up downloading the same things many times. <!-- .element: class="fragment" -->
- Developing across frames isn't bad but it's not fun. <!-- .element: class="fragment" -->

Notes:

- To compare solutions, let's consider iFrames. We should be able to split our app up that way, right?
- Instead of a single web app stitched together from smaller web apps, we have a bunch of web apps running in the same window.
- It splits up our code, but at a cost:
  - (next)
  - It can be hard to share things between the parent and child iframes
    - Context of who the user is
    - Current URL.
  - (next)
  - It can be heavy, and depending on how big the app is behind the iframe, slow.
  - (next)
  - The developer experience isn't awful, but communicating across an iFrame boundary can be a pain.
  - It’s more limited in what a micro frontend can be.
- I won’t get into iFrames today, but if you want to, give it a try! It’s a super easy way to start playing with these ideas.

---

<!-- .slide: data-auto-animate -->

## Module Federation

Notes:

- But let's talk about a different solution.

---

<!-- .slide: data-auto-animate -->

## Module Federation

https://module-federation.github.io/

Notes:

- I'm going to take a pretty quick pass through the ideas of Module Federation, but if you want to learn more,
  I suggest checking out their Github organization.
- You can find support for even more tools there.

---

<!-- .slide: data-auto-animate -->

## Webpack

## Module Federation

## In React <!-- .element: class="fragment" -->

Notes:

- Today, though, let's focus on Webpack. It's what I'm most familiar with, and I think the concepts are going to be pretty transferrable.
- (next)
- And because I haven't narrowed my focus enough, let's focus specifically on React web applications.
- Not to worry - if you don't use React, a lot of these concepts can still apply to you. It's all just Javascript modules!

---

## Get Building 🛠️

Notes:

- I'm going to go through some of the major steps to get setup with Module Federation.
- We're going to create a single host app and two remote apps.
- And as much as I'm sure you'd love to watch me live code three apps... I'm going to skip that bit.
- But, I'll make all the slides and code available at the end.

---

<!-- .slide: data-background-color="white" data-background-iframe="https://host-app-mfe-example-salockhart.fly.dev/remote1?spin=true" data-preload -->

Notes:

- We have a host app with a set of tabs that will let us load other content.
- For now, it's just spinning, waiting for the remotes!

---

<!-- .slide: data-background-color="white" data-background-iframe="https://remote-app-1-mfe-example-salockhart.fly.dev/" data-preload -->

Notes:

- We have our first remote app: a list of products.

---

<!-- .slide: data-background-color="white" data-background-iframe="https://remote-app-2-mfe-example-salockhart.fly.dev/" data-preload -->

Notes:

- And we have our second remote app: a checkout form.
- Now, let's put them all together!

---

## Move Things Around

```sh
mv src/index.tsx src/bootstrap/local.tsx
```

Notes:

- We need to make some tweaks to the standard CRA app structure.
- Since our apps are going to have multiple entrypoints, bundling everything into `index.tsx` doesn't make sense.
- Let's create a `bootstrap` directory that we can use to hold all our entrypoints.
- Now, our original "run this app" index.tsx is just our "local" entrypoint.

---

## Create Room For Magic

```ts [|,3]
// src/index.ts

import("./bootstrap/local").catch((e) => console.error(e));

// magic 🪄

export {};
```

Notes:

- Then, since Create-React-App still wants a standard entrypoint for local development, let's give it one.
- (next)
- But!
  - We don't just "re-export" our entrypoint. That's important.
  - Instead, we make it load our application async. This will be important later!

---

## Dependencies

- `react-app-rewired`
- `webpack-merge`

Notes:

- Next, we need some dependencies to help apply some configuration.
- `react-app-rewired` is going to let us hook into the Create React App scripts so that we don't have to "eject".
- `webpack-merge` is going to let us easily apply our changes to the default CRA Webpack config.

---

<!-- .slide: data-auto-animate -->

## Get Our Remotes Ready

```ts
// src/bootstrap/app/tsx

import { App } from "../App";

export default App;
```

Notes:

- Earlier, we created our "local" entrypoint that mounted the app and ran it.
- Our remote doesn't need to mount itself, though! The host will do that.
- So, we need a new entrypoint for our host app to use.
- Notice this one is just our app that we export.
  - We don't want to include providers in here. We want it as basic as possible!
  - If we wrap our App with providers here, they'll cover up the ones from the host.

---

<!-- .slide: data-auto-animate -->

## Get Our Remotes Ready

```js [|10,15|11|16|17-19|20-30]
/* config-overrides.js */

const { merge } = require("webpack-merge");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const { dependencies } = require("./package.json");

module.exports = function override(config) {
  return merge(config, {
    output: {
      uniqueName: "remote_app_1",
      publicPath: "http://localhost:3001/",
    },
    plugins: [
      new ModuleFederationPlugin({
        name: "remote_app_1",
        filename: "remoteEntry.js",
        exposes: {
          "./App": "./src/bootstrap/app",
        },
        shared: {
          ...dependencies,
          react: {
            singleton: true,
            requiredVersion: dependencies["react"],
          },
          "react-dom": {
            singleton: true,
            requiredVersion: dependencies["react-dom"],
          },
        },
      }),
    ],
  });
};
```

Notes:

- Now that we have `react-app-rewired` installed, we need to install our configuration overrides.
- Oh boy, we really added a lot here. Let's go through it.
  - (next)
  - First, we name this app so that Webpack can refer to it later.
  - (next)
  - We add a public path where this remote can be reached. For now, we'll do `localhost`.
  - (next)
  - Then, we added the name of the file that can be used to load this remote.
  - (next)
  - We declared what components we expose through that `remoteEntry.js` file
    - Here's our `app` entrypoint from the previous step!
  - (next)
  - Finally, we declared the dependencies that this remote "shares".
    - Let's talk about that.

---

## Sharing Dependencies

```ts
shared: {
  ...dependencies,
  react: {
    singleton: true,
    requiredVersion: dependencies["react"],
  },
  "react-dom": {
    singleton: true,
    requiredVersion: dependencies["react-dom"],
  },
}
```

Notes:

- These shared dependencies are the reason why we need the "room for magic" above.
- By sharing dependencies across our microfrontends, we're getting at our first two goals:
  1. It should feel like one application
  2. It should be performant
- Let's look at why.

---

<div style="display: grid; grid-template-columns: 1fr 1fr; font-size: 30px;">
  <div>
    Module Federation ❌
    <pre>
      <code data-trim data-noescape data-line-numbers="|8|7" class="language-sh">
        build
        ├── index.html
        └── static
            ├── css
            │   └── main.8a685450.css
            └── js
                ├── 787.83a184bd.chunk.js
                └── main.d2804cea.js
      </code>
    </pre>
  </div>
  <div>
    Module Federation + Sharing ✅
    <pre>
      <code data-trim data-noescape data-line-numbers="|21|7-20" class="language-sh">
        build
        ├── index.html
        └── static
            ├── css
            │   └── 735.19f42a5c.chunk.css
            └── js
                ├── 164.d173b888.chunk.js
                ├── 184.658dae2a.chunk.js
                ├── 192.eeafc2fa.chunk.js
                ├── 225.77016a9a.chunk.js
                ├── 357.e948afb0.chunk.js
                ├── 361.5b8c06a6.chunk.js
                ├── 677.5bffb570.chunk.js
                ├── 702.bc15c451.chunk.js
                ├── 73.23dbfaa2.chunk.js
                ├── 735.693974f1.chunk.js
                ├── 783.97111ac3.chunk.js
                ├── 787.1912ef9c.chunk.js
                ├── 791.6276d6ee.chunk.js
                ├── 938.c91fb019.chunk.js
                └── main.24d3dcb7.js
      </code>
    </pre>
  </div>
</div>

Notes:

- The easiest way to illustrate this is in the build artifacts.
- On the left hand side, we have a standard CRA output.
  - We've got our main bundle with _everything_ in it
  - And we've got a separate bundle that is really just the `web-vitals` package.
- On the right hand side, through, is a different story.
  - We've still got a main bundle, but it's _very_ small. Pretty much just Webpack.
  - And then we've got a ton of other bundles. In fact, we've got roughly one for every dependency that we are sharing.
- **This** is where Module Federation really shines.
  - Since each of these chunks is a dependency, we only have to load them if we need them.
  - So if either the host or the remote have a (valid) dependency already, we skip it.
  - This means we can load our remotes super fast, since they might just be our own code and no dependencies.

---

## Woah!

But what's in each chunk?

```sh
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

Notes:

- You might be asking yourselves, how can I be confident about what is in each chunk?
- You can use the `source-map-explorer` tool to see for youself.

---

## Sharing Dependencies

```ts [|2|3,4,7,8]
shared: {
  ...dependencies,
  react: {
    singleton: true,
    requiredVersion: dependencies["react"],
  },
  "react-dom": {
    singleton: true,
    requiredVersion: dependencies["react-dom"],
  },
}
```

Notes:

- One more thing.
- (next)
- You'll notice that for most of the dependencies, we're just spreading them.
- (next)
- But for React and React DOM, we're adding some extra - we're declaring them `singleton`s.
  - A `singleton` shared dependency means that only one version will ever be present in the runtime.
  - This is super important for React and React DOM since they have set global state as part of their operations.
  - Without this, our remotes will create their own React references, and everything will fall apart.

---

<!-- .slide: data-auto-animate -->

## Get Our Host Ready

```js [|9|18-28|14-17]
const { merge } = require("webpack-merge");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const { dependencies } = require("./package.json");

module.exports = function override(config) {
  return merge(config, {
    output: {
      uniqueName: "host_app",
      publicPath: "http://localhost:3000/",
    },
    plugins: [
      new ModuleFederationPlugin({
        name: "host_app",
        remotes: {
          remote_app_1: "remote_app_1@http://localhost:3001/remoteEntry.js",
          remote_app_2: "remote_app_2@http://localhost:3002/remoteEntry.js",
        },
        shared: {
          ...dependencies,
          react: {
            singleton: true,
            requiredVersion: dependencies["react"],
          },
          "react-dom": {
            singleton: true,
            requiredVersion: dependencies["react-dom"],
          },
        },
      }),
    ],
  });
};
```

Notes:

- Alright. Home stretch. Our remotes are done, let's look at the host.
- Most of this will be familiar. Let's go through the changes.
  - (next)
  - We added a public path here too.
  - (next)
  - And, our shared dependencies again.
  - (next)
  - But this is the fun bit. Here we declare what remote apps this project can access.

---

<!-- .slide: data-auto-animate -->

```text
remote_app_1@http://localhost:3001/remoteEntry.js
```

Notes:

- Let's take a closer look at that.
- This path that we use here, we actually build this up out of the configuration we use in the remote.

---

<!-- .slide: data-auto-animate -->

```text
remote_app_1@http://localhost:3001/remoteEntry.js
```

```js [11,15,16]
/* config-overrides.js */

const { merge } = require("webpack-merge");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const { dependencies } = require("./package.json");

module.exports = function override(config) {
  return merge(config, {
    output: {
      uniqueName: "remote_app_1",
      publicPath: "http://localhost:3001/",
    },
    plugins: [
      new ModuleFederationPlugin({
        name: "remote_app_1",
        filename: "remoteEntry.js",
        exposes: {
          "./App": "./src/bootstrap/app",
        },
        shared: {
          ...dependencies,
          react: {
            singleton: true,
            requiredVersion: dependencies["react"],
          },
          "react-dom": {
            singleton: true,
            requiredVersion: dependencies["react-dom"],
          },
        },
      }),
    ],
  });
};
```

Notes:

- Here, that's better. We can see now that it's really just three fields from the remote's webpack config
  - The `name` is our "username" in the URL
  - The `publicPath` becomes the base of our URL
  - And the `filename` becomes the file we append to the base.

---

<!-- .slide: data-auto-animate -->

## Get Our Host Ready

```js [14-17]
const { merge } = require("webpack-merge");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const { dependencies } = require("./package.json");

module.exports = function override(config) {
  return merge(config, {
    output: {
      uniqueName: "host_app",
      publicPath: "http://localhost:3000/",
    },
    plugins: [
      new ModuleFederationPlugin({
        name: "host_app",
        remotes: {
          remote_app_1: "remote_app_1@http://localhost:3001/remoteEntry.js",
          remote_app_2: "remote_app_2@http://localhost:3002/remoteEntry.js",
        },
        shared: {
          ...dependencies,
          react: {
            singleton: true,
            requiredVersion: dependencies["react"],
          },
          "react-dom": {
            singleton: true,
            requiredVersion: dependencies["react-dom"],
          },
        },
      }),
    ],
  });
};
```

Notes:

- Keep in mind that we can assign these remote URLs to whatever we like.
- Here we use the same name that the remotes declare in Webpack, but they could be anything.
- I find it is a good practice to keep the number of names we have to remember small, though.

---

<!-- .slide: data-auto-animate -->

## Get Our Host Ready

```tsx [|1|3-7|3,7|4,6|5]
const Remote1App = React.lazy(() => import("remote_app_1/App"));

<ErrorBoundary fallback={<Typography>Oops!</Typography>}>
  <React.Suspense fallback={<CircularProgress />}>
    <Remote1App />
  </React.Suspense>
</ErrorBoundary>;
```

Notes:

- Awesome. Now we're ready to use it!
- (next)
- First, we import it. The module we import is "name of remote in webpack" / "name of exposed component"
  - The `React.lazy` is important here, too. With this, we'll only fetch the remote bundle when we need to render it.
- (next)
- Then we use it!
  - (next)
  - We wrap the whole thing in an error boundary in case the component fails to load.
  - (next)
  - We wrap it in Suspense too, so that we can display a spinner while it loads.
  - (next)
  - And then we just render the component.

---

<!-- .slide: data-background-color="white" data-background-iframe="https://host-app-mfe-example-salockhart.fly.dev/remote1" data-preload -->

Notes:

- And it Just Works™️

---

## Goals

1. It should feel like one application <!-- .element: class="fragment" -->
2. It should be performant <!-- .element: class="fragment" -->
3. It should have a great development experience <!-- .element: class="fragment" -->

Notes:

- Let's revisit our goals.
- (next)
- This feels like one application. And in truth it is! Everything gets loaded into the same JS runtime.
- (next)
- This is also fairly performant. We end up have to make more network requests, but we aren't downloading React three times. We aren't eagerly fetching every remote. And once it's all in the browser, it works great.
- (next)
- And finally, while I didn't get into it much today, it's easy to develop on. I can work on a single MFE in isolation and not worry about having to bootstrap the world to get there.

---

## Gotchas

1. Caching <!-- .element: class="fragment" -->
2. Deployments <!-- .element: class="fragment" -->
3. Dependency Clashes <!-- .element: class="fragment" -->
4. Dirty Contexts <!-- .element: class="fragment" -->

Notes:

- Finally, there are some gotchas.
- You'll recall that we load the remote MFEs with a `remoteEntry.js` file.
  - It has no hash! If it did, our host couldn't find it.
  - **But**, this means we need to be super careful that our webserver doesn't cache it.
- Part of this comes up when we deploy.
  - If our host has loaded the `remoteEntry.js` file, but not the chunks, what happens if we deploy?
  - The chunks might have changed, and might not be available any more.
  - To get around this, we can either keep old versions accessible for a period of time, or we can make the host re-fetch the `remoteEntry.js` file if it fails to load a chunk.
- With all these shared dependencies rolling around, we need to be careful.
  - React Router specifically wants the **same exact** version to be used across the entire runtime. Otherwise, your remotes might fail to load!
- And finally, dirty contexts. If one of your remotes loads some global CSS, the rest of your app is going to see it. That can be a great thing! But it can also muck things up.

---

## Thank you!

</textarea>
</section>
