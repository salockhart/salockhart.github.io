---
title: Microfrontends
reveal:
  totalTime: 1800
---

<!-- Get the assets path, removing the trailing slash -->

{% assign page_includes = page.slug | split: '/' | join: '/' %}
{% assign page_assets = page.url | prepend: '/assets' | split: '/' | join: '/' %}

<style>
  .one-col {
    display: grid;
    grid-template-columns: 1fr;
  }

  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .three-col {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
  }

  .place-center {
    place-items: center;
  }

  .font-sm {
    font-size: 30px;
  }

  .font-md {
    .font-size: 35px;
  }

  .fragment.semi-fade-out-then-in {
    opacity: 1;
  }

  .fragment.semi-fade-out-then-in.current-fragment {
    opacity: .5;
  }

  [data-qr-code] img {
    padding: 16px;
    background: white;
  }
</style>

<section data-markdown>
<textarea data-template>

<h2>
Microfrontends
<br />
&
<br />
Module Federation
</h2>

Alex Lockhart

---

# Hi 👋

Notes:

- Before we get into things, let me introduce myself.
- Hi, I'm Alex.
- I grew up here in Halifax, and I've been working as a Software Developer for just about 7 years now.
- I even worked at REDSpace for just under a year!
- I spent the last few years in the UK working, before coming back to Halifax last year.

---

<div class="two-col">
  <img src="{{ page_assets }}/img/amelia-1.jpeg" />
  <img src="{{ page_assets }}/img/amelia-2.jpeg" />
</div>

Notes:

- And of course, most importantly, my partner and I have a cat named Amelia.

---

## Some Assumptions

- Create React App (CRA) <!-- .element: class="fragment" -->
- React (ReactDOM, rendering) <!-- .element: class="fragment" -->
- Some advanced React APIs (Lazy, Error Boundaries, Suspense) <!-- .element: class="fragment" -->
- Dependencies <!-- .element: class="fragment" -->
- Bundlers (Webpack, plugins, singletons) <!-- .element: class="fragment" -->

Notes:

- We're going to talk about a lot of things today!
- It's okay if you haven't used these things, or even heard of them before.
- I'm going to try to explain all the important bits as we go along.
- Knowledge of these is hopefully not necessary to understand this talk.
- But here's a few things that will come up.
- If you want to talk about these in-depth, come find me after the talk!
- First, we're going to be pretty React heavy tonight. That means:
- (next)
- I'll be assuming you're familiar with Create React App,
- (next)
- and React itself, as well as
- (next)
- some of the more advanced React APIs like Lazy, Error Boundaries, and Suspense.
- (next)
- We'll also be talking about dependencies,
- (next)
- and how they're bundled.

---

<!-- .slide: data-auto-animate data-auto-animate-id="the-problem" -->

## The Problem

<div class="three-col place-center">
  <img src="{{ page_assets }}/img/web-app-monolith.png" style="width: 40%; justify-self: end;" />
  <div class="r-stack" style="padding: 100px">
    <img src="{{ page_assets }}/img/arrow.png" />
    <img src="{{ page_assets }}/img/arrow.png" />
    <img src="{{ page_assets }}/img/arrow.png" />
    <img src="{{ page_assets }}/img/arrow.png" />
    <img src="{{ page_assets }}/img/arrow.png" />
    <img src="{{ page_assets }}/img/arrow.png" />
    <img src="{{ page_assets }}/img/arrow.png" />
    <img src="{{ page_assets }}/img/arrow.png" />
    <img src="{{ page_assets }}/img/arrow.png" />
  </div>
  <img src="{{ page_assets }}/img/server-monolith.png" style="width: 40%; justify-self: start;" />
</div>

Notes:

- The classic client-server relationship. Our business sells shapes!
- Our users go to our website, our app loads, and they do things that talk to the server.
- Business is going well. So well, in fact, that our application keeps growing.

---

<!-- .slide: data-auto-animate data-auto-animate-id="the-problem" -->

## The Problem

<style>
  .problem.many-arrow {
    padding: 40px;
  }

  .problem.many-arrow img {
    width: 40%;
    position: relative; 
  }
</style>

<div class="three-col place-center">
  <img src="{{ page_assets }}/img/web-app-monolith.png" />
  <div class="r-stack problem many-arrow">
    <img src="{{ page_assets }}/img/arrow.png" style="top: -20px; left: -15px" />
    <img src="{{ page_assets }}/img/arrow.png" style="top: 40px; left: -10px" />
    <img src="{{ page_assets }}/img/arrow.png" style="top: 60px; left: 0px" />
    <img src="{{ page_assets }}/img/arrow.png" style="top: -40px; left: 10px" />
    <img src="{{ page_assets }}/img/arrow.png" style="top: -80px; left: 5px" />
    <img src="{{ page_assets }}/img/arrow.png" style="top: 80px; left: -20px" /> 
    <img src="{{ page_assets }}/img/arrow.png" style="top: 0px; left: 15px" />
    <img src="{{ page_assets }}/img/arrow.png" style="top: 20px; left: -5px" />
    <img src="{{ page_assets }}/img/arrow.png" style="top: -60px; left: 20px" />
  </div>
  <img src="{{ page_assets }}/img/server-monolith.png" />
</div>

Notes:

- And GROWING.

---

## Why is this a problem?

- Longer build times <!-- .element: class="fragment" -->
- Longer load times <!-- .element: class="fragment" -->
- Lots of commits to the same code <!-- .element: class="fragment" -->

Notes:

- So why is this a problem?
- (next)
- Well, bigger applications also mean longer build times, both locally and in your CI pipeline.
  - When your application takes an hour to build… you have a problem.
- (next)
- Bigger applications also mean longer load times, which means that your users have to wait!
- (next)
- And, bigger applications probably mean a lot more developers all working on the same code.

---

## Goals

1. It should feel like one application <!-- .element: class="fragment" -->
2. It should be performant <!-- .element: class="fragment" -->
3. It should have a great development experience <!-- .element: class="fragment" -->

Notes:

- Looking at what we can do in the backend, we can set some goals.
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

<style>
  .microservices-diagram img {
    width: 50%;
  }
</style>

<div class="microservices-diagram place-center" style="display: grid; grid-template-columns: repeat(3, 1fr) 2fr;">
  <img src="{{ page_assets }}/img/web-app-monolith.png" />
  <img src="{{ page_assets }}/img/arrow.png" />
  <img src="{{ page_assets }}/img/server-blank.png" />
  <div class="two-col place-center">
    <img src="{{ page_assets }}/img/arrow.png" style="position: relative; top: 80px; rotate: -30deg;" />
    <img src="{{ page_assets }}/img/server-green.png" />
    <img src="{{ page_assets }}/img/arrow.png" style="position: relative; top: 20px; rotate: -15deg" />
    <img src="{{ page_assets }}/img/server-yellow.png" />
    <img src="{{ page_assets }}/img/arrow.png" style="position: relative; bottom: 20px; rotate: 15deg" />
    <img src="{{ page_assets }}/img/server-red.png" />
    <img src="{{ page_assets }}/img/arrow.png" style="position: relative; bottom: 80px; rotate: 30deg" />
    <img src="{{ page_assets }}/img/server-blue.png" />
  </div>
</div>

Notes:

- We have ways of achieving these goals on the backend. We can start splitting up our servers into a classic microservice architecture.
- Instead of a monolith that handles EVERYTHING, we have an entrypoint and a bunch of smaller microservices that handle specific slices of our business.
- This lets our development teams each focus on one or more individual microservices - no more giant merge conflicts because you’re in the same codebase with 100 other people.
- These microservices are also much faster to build and deploy - instead of waiting an hour for our monolith, it might take only 10 minutes for our microservice to deploy.
- And most importantly - if we do it right, our users will never be able to tell the difference.
- That’s great for our backend - but what about our web app?

---

<!-- .slide: data-auto-animate data-auto-animate-id="web-app-slices" -->

<div class="r-stack">
  <img src="{{ page_assets }}/img/web-app-blank.png" />
  <img src="{{ page_assets }}/img/web-app-green.png" style="position: relative; bottom: 60px; right: 95px;" />
  <img src="{{ page_assets }}/img/web-app-yellow.png" style="position: relative; right: 48px; top: 50px;" />
  <img src="{{ page_assets }}/img/web-app-red-blue.png" style="position: relative; left: 85px;" />
</div>

Notes:

- Well, what if we sliced it up?

---

<!-- .slide: data-auto-animate data-auto-animate-id="web-app-slices" -->

<div class="r-stack">
  <img src="{{ page_assets }}/img/web-app-blank.png" />
  <img src="{{ page_assets }}/img/web-app-green.png" style="position: relative; bottom: 100px; right: 300px;" />
  <img src="{{ page_assets }}/img/web-app-yellow.png" style="position: relative; right: 300px; top: 50px;" />
  <img src="{{ page_assets }}/img/web-app-red-blue.png" style="position: relative; left: 300px;" />
</div>

## Microfrontends <!-- .element: class="fragment" -->

## (or MFEs) <!-- .element: class="fragment" style="text-transform: initial" -->

Notes:

- Instead of a single monolith web application, we could break this up into multiple small ones
- Each small web app could then handle it's own things, and we'd stitch them together to make a single consistent experience
- (next)
- We could even call them.... **Microfrontends**
- (next)
- Or for short, MFEs

---

{% assign mfe_diagram_group_1 = 'data-fragment-index="1" class="fragment custom semi-fade-out-then-in"' %}
{% assign mfe_diagram_group_2 = 'data-fragment-index="2" class="fragment semi-fade-out"' %}
{% assign mfe_diagram_group_none = 'data-fragment-index="1" class="fragment semi-fade-out"' %}

<style>
  .mfe-diagram img {
    width: 50%;
  }
</style>

<div class="mfe-diagram place-center" style="display: grid; grid-template-columns: 1fr 3fr 1fr 1fr;">
  <img src="{{ page_assets }}/img/web-app-blank.png" {{ mfe_diagram_group_2 }} style="width: 100%;" />
  <div class="three-col place-center">
    <img src="{{ page_assets }}/img/arrow.png" {{ mfe_diagram_group_none }} style="position: relative; top: 60px; rotate: -30deg;" />
    <img src="{{ page_assets }}/img/web-app-green.png" {{ mfe_diagram_group_1 }} style="width: 75%;" />
    <img src="{{ page_assets }}/img/arrow.png" {{ mfe_diagram_group_none }} style="position: relative; top: 60px; rotate: 30deg;" />
    <img src="{{ page_assets }}/img/arrow.png" {{ mfe_diagram_group_none }} />
    <img src="{{ page_assets }}/img/web-app-yellow.png" {{ mfe_diagram_group_1 }} style="width: 75%;"  />
    <img src="{{ page_assets }}/img/arrow.png" {{ mfe_diagram_group_none }} />
    <img src="{{ page_assets }}/img/arrow.png" {{ mfe_diagram_group_none }} style="position: relative; bottom: 60px; rotate: 30deg;" />
    <img src="{{ page_assets }}/img/web-app-red-blue.png" {{ mfe_diagram_group_1 }} style="width: 75%;" />
    <img src="{{ page_assets }}/img/arrow.png" {{ mfe_diagram_group_none }} style="position: relative; bottom: 60px; rotate: -30deg;" />
  </div>
  <img src="{{ page_assets }}/img/server-blank.png" {{ mfe_diagram_group_none }} />
  <img src="{{ page_assets }}/img/arrow.png" {{ mfe_diagram_group_none }} />
</div>

Notes:

- So how would this work?
- Well, if we follow the general pattern of the microservices, we'd have...
- (next)
- A main entrypoint into our application. Let's call this the **host**.
  - It's going to be as lean as possible.
  - It's going to be responsible for bootstrapping our application in the browser.
  - It's going to be responsible for loading the rest of our application.
- (next)
- And the rest of our application is going to be made up of all those slices we made. Let's call these **remotes**.
  - They're going to be responsible for exporting modules that our host can load.
  - They're going to be responsible for all of our business logic.
- So how do we stitch these together?

---

<!-- .slide: data-auto-animate data-auto-animate-id="module-federation" -->

## Module Federation

Notes:

- There's a couple different ways, but I'm going to talk about an approach using Module Federation.

---

<!-- .slide: data-auto-animate data-auto-animate-id="module-federation" -->

## Module Federation

https://module-federation.github.io/

Notes:

- This won't be a full tutorial, but if you want to learn more, I suggest checking out their Github organization.
- You can find support for even more tools there.

---

<!-- .slide: data-auto-animate data-auto-animate-id="module-federation" -->

## Webpack

## Module Federation

## In React <!-- .element: class="fragment" -->

Notes:

- Today, though, let's focus on Webpack Module Federation.
  - I know: Webpack! Why not vite or esbuild or snowpack or rollup or...
  - Module Federation was first introduced in Webpack 5.
  - It's since been ported to other bundlers.
  - It's what I'm most familiar with.
  - And I promise, a lot of the config we go over will be transferrable to other bundlers.
- (next)
- And because I haven't narrowed my focus enough, let's focus specifically on React web applications.
  - Not to worry - if you don't use React, a lot of these concepts can still apply to you. It's all just Javascript modules!

---

## Get Building 🛠️

Notes:

- Before we can setup Module Federation, we need some apps!
- We're going to create a single host app and two remote apps.
- And as much as I'm sure you'd love to watch me live code three apps... I'm going to skip that bit.
- But, all the slides and code will be available at the end.

---

<!-- .slide: data-background-color="white" data-background-iframe="https://lockhart.dev/module-federation-example/host-app/#/remote1?spin=true" data-preload -->

Notes:

- We have a host app with a set of tabs that will let us load other content.
- For now, it's just spinning, waiting for the remotes!

---

<!-- .slide: data-background-color="white" data-background-iframe="https://lockhart.dev/module-federation-example/remote-app-1/" data-preload -->

Notes:

- We have our first remote app: a list of products.

---

<!-- .slide: data-background-color="white" data-background-iframe="https://lockhart.dev/module-federation-example/remote-app-2/" data-preload -->

Notes:

- And we have our second remote app: a checkout form.
- Now, let's put them all together!

---

# Setup

## Remotes

Notes:

- First, let's check out how we configure our remotes.

---

## Remote Webpack Config

```sh
npm i react-app-rewired webpack-merge
```

<div class="font-md">

```js [|10,15|11|16|17-19]
{% include_relative {{ page_includes | append: '/code/remote-webpack-config.js' }} %}
```

</div>

Notes:

- There's a lot here! Let's break it down.
  - (next)
  - First, we name this app so that Webpack can refer to it later.
  - (next)
  - We add a public path where this remote can be reached from the browser. For now, we'll do `localhost`.
  - (next)
  - Then, we added the name of the file that can be used to load this remote.
  - (next)
  - And finally, we get to the good bit!
    - We declare what components we expose through that `remoteEntry.js` file.
    - Here, we're exposing an `App` component. Let's look at how we do that.

---

## `remote` Entrypoint

```ts [|5]
// src/bootstrap/remote.tsx

import { App } from "../App";

export default App;
```

Notes:

- The `remote` entrypoint!
- Remember: our remote apps don't create the React root nor do any bootstraping. The host does that.
- So, this entrypoint doesn't! It just exports the component we want to expose.
- We want it as basic as possible!
  - If we wrap our App with providers here, they'll cover up the ones from the host.
- (next)
- And we want to make this a default export. Named exports can work too, but they're a bit more work to setup.

---

## Remote Webpack Config

<div class="font-md">

```js [20-30]
{% include_relative {{ page_includes | append: '/code/remote-webpack-config.js' }} %}
```

</div>

Notes:

- Back to the config. There was one more section we didn't look at.
- We declared the dependencies that this remote "shares".
  - Let's take a look at what this means.

---

## Dependencies

<div class="font-sm">

```json [6-26]
{% include_relative {{ page_includes | append: '/code/remote-package.json' }} %}
```

</div>

Notes:

- Here's the package.json for one of our remote apps.
- Like you can see here, we've got a lot of dependencies!
  - React, React DOM, ...
  - But also some others, like Material UI.
- Each of these dependencies represents "someone else's code" that we are using.
- They also tend to make up the bulk of our app's bundle size.
- And the bigger our bundle size, the more our users need to download before using our app!
- But wait.. if we have three different apps, aren't we tripling the number of times we need to download our dependencies?
  - This is what sharing is for!

---

## Sharing Dependencies

<div class="font-md">

```js [20-30|5|20-30]
{% include_relative {{ page_includes | append: '/code/remote-webpack-config.js' }} %}
```

</div>

Notes:

- Right. We've got our sharing config in our webpack file.
- (next)
- And we are importing the dependencies we want to share from our package.json, essentially saying "share everything."
- (next)
- Let's see what that results in.

---

<div class="two-col font-sm">
<div>

Module Federation ❌

```sh [|8|7]
build
├── index.html
└── static
    ├── css
    │   └── main.8a685450.css
    └── js
        ├── 787.83a184bd.chunk.js
        └── main.d2804cea.js
```

</div>
<div>

Module Federation + Sharing ✅

```sh [|21|7-20]
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
```

</div>

Notes:

- Let's start by taking a look at the result of our build.
- On the left hand side, we have a standard CRA output.
  - (next)
  - We've got our main bundle with _everything_ in it
  - (next)
  - And we've got a separate bundle that is really just the `web-vitals` package.
- On the right hand side, through, is a different story.
  - (next)
  - We've still got a main bundle, but it's _very_ small. Pretty much just Webpack.
  - (next)
  - And then we've got a ton of other bundles. In fact, we've got roughly one for every dependency that we are sharing.
    - "But how do we know that?" I'm glad you asked!

---

```sh
npm run build
npx source-map-explorer 'build/static/js/*.js'
```

Notes:

- Let's build our apps, and then we can analyze the build with our source map explorer!

---

<!-- .slide: data-background-color="white" data-background-iframe="https://lockhart.dev/module-federation-example/remote-app-1/source-map-explorer.html" data-preload -->

Notes:

- And that will show us... this!
- First, let's talk about what we're looking at.
- Roughly, each square we see is proportionate to the size it takes up in our final bundle size.
- See this giant one? That's Material UI.
- Want to guess how much of this is "our" code?
- That's right, it's the square **way** down in the bottom right. 0.6% of our bundle size.
- If we were to go through the rest of these, we'd see that each of these chunks is (roughly) a single dependency that we are sharing.
- **This** is where Module Federation really shines.
  - Since each of these chunks is a dependency, we can choose what we load.
  - If the host has already loaded Material UI, we can just skip loading this entire chunk!
  - That's a massive savings in bundle size, and a massive savings in load time for our users.

---

## Sharing Dependencies

```ts [20-30|21|22,23,26,27]
{% include_relative {{ page_includes | append: '/code/remote-webpack-config.js' }} %}
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

# 😮‍💨

Notes:

- That's a lot.
- Phew.
- We've covered a lot of ground here.
  - We've talked about how to export components from our remotes.
  - And we've talked about how to share dependencies to increase our performance.
- Let's keep going. Almost done.

---

# Setup

## Hosts

Notes:

- Let's check out how we configure our hosts. We'll make this quick.

---

## Host Webpack Config

```sh
npm i react-app-rewired webpack-merge
```

<div class="font-md">

```js [|15-25|11-14]
{% include_relative {{ page_includes | append: '/code/host-webpack-config.js' }} %}
```

</div>

Notes:

- There's a bit less config here.
- (next)
- We've got the same shared dependencies again.
  - And it has to be the same! If the remote shares something that the host doesn't, it won't be shared.
- (next)
- But this is the fun bit. Here we declare what remote apps this project can access.

---

<!-- .slide: data-auto-animate data-auto-animate-id="remote-url" -->

## Remote URL

```text
remote_app_1@http://localhost:3001/remoteEntry.js
```

Notes:

- Let's take a closer look.
- This path that we use here, we actually build this up out of the configuration we use in the remote.

---

<!-- .slide: data-auto-animate data-auto-animate-id="remote-url" -->

## Remote URL

```text
remote_app_1@http://localhost:3001/remoteEntry.js
```

```text
{name}@{publicPath}{filename}
```

<div class="font-md">

```js [11,15,16]
{% include_relative {{ page_includes | append: '/code/remote-webpack-config.js' }} %}
```

</div>

Notes:

- The `name` is our "username" in the URL
- The `publicPath` becomes the base of our URL
- And the `filename` becomes the file we append to the base.

---

<!-- .slide: data-auto-animate data-auto-animate-id="get-our-host-ready" -->

## Render Our Remote

<div class="font-md">

```tsx [|1|3-7|3,7|4,6|5]
const Remote1App = React.lazy(() => import("remote_app_1/App"));

<ErrorBoundary fallback={<h1>🤷</h1>}>
  <React.Suspense fallback={<CircularProgress />}>
    <Remote1App />
  </React.Suspense>
</ErrorBoundary>;
```

</div>

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
    - We're just rendering it as-is, but this is a fully fledged React component! You can pass props, you can wrap it in other components, you can do whatever you like.

---

# Last Thing!

---

<!-- .slide: data-auto-animate data-auto-animate-id="bootstrapping-locally" -->

## `host` Entrypoint

```tsx []
// src/bootstrap/host.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "../App";
import "../index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Notes:

- Remember, we said that the host was responsible for bootstrapping our application in the browser.
- So we need a host entrypoint!
- There's not much to discuss here. This is just the standard CRA `index.tsx` file, moved & renamed.
  - It imports the App, creates the root, and renders it.
- But! The fun thing is we add this to our remotes, too!
  - In our host, we use the host entrypoint both to deploy the application, and when developing it.
  - In our remotes, we use it mainly for development. That way we don't need to run our whole platform locally to develop our apps!

---

<!-- .slide: data-auto-animate data-auto-animate-id="bootstrapping-locally" -->

## `host` Entrypoint

```tsx [|3-4|6-8]
// src/index.ts

// ❌ This won't work once we turn on Module Federation!
// import "./bootstrap/host";

// 🪄 magic
// Import the component, create the React root, render...
import("./bootstrap/host").catch((e) => console.error(e));

// TS wants an import, export, or an
// empty 'export {}' statement to make it a module.
export {};
```

Notes:

- But there's an important wrinkle here.
- (next)
- We don't just import the entrypoint. That's important.
  - This would work without Module Federation, but with it, we will just get a blank screen.
- (next)
- Instead, we make it import our entrypoint asynchronously.
- Remember all those chunks? Well, if those chunks are our dependencies, we need fetch them before we can fetch our app.
- By importing our host entrypoint async, we make sure that all of our dependencies are loaded before we try to render our app.

---

# 🥁 🥁 🥁

---

<!-- .slide: data-background-color="white" data-background-iframe="https://lockhart.dev/module-federation-example/host-app" data-preload -->

# 🎉 🎉 🎉 <!-- .element: class="fragment fade-out" -->

Notes:

- And it Just Works™️
- (next)
- And not only does it work, but we get some amazing benefits.
  - First off, our host-app provides an MUI theme. And if the theme changes in the host, it changes the remotes, too!
  - Now think, what if we had a shared React Query context? Or a shared React Router context? We'd be able to do a ton of really powerful things, all with different apps!

---

## Did We Meet Our Goals?

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
- (next)
- You'll recall that we load the remote MFEs with a `remoteEntry.js` file.
  - It has no hash! If it did, our host couldn't find it.
  - **But**, this means we need to be super careful that our webserver and our browser don't cache it.
- (next)
- Part of this comes up when we deploy.
  - If our host has loaded the `remoteEntry.js` file, but not the chunks, what happens if we deploy?
  - The chunks might have changed, and might not be available any more.
  - To get around this, we can either keep old versions accessible for a period of time, or we can make the host re-fetch the `remoteEntry.js` file if it fails to load a chunk.
- (next)
- With all these shared dependencies rolling around, we need to be careful.
  - React Router specifically wants the **same exact** version to be used across the entire runtime. Otherwise, your remotes might fail to load!
- (next)
- And finally, dirty contexts. If one of your remotes loads some global CSS, the rest of your app is going to see it. That can be a great thing! But it can also muck things up.

---

## ✂️ Cut For Time ✂️

- A Remote can be a Host, too!
- We can federate any JS modules - not just components.
- We can have an app made up of mixed frameworks!

---

## Thank you!

<div class="two-col place-center">
  <div class="one-col place-center">
    <p>Alex Lockhart</p>
    <img src="/assets/profile.jpg" alt="a photo of the author" style="width: 200px" />
    <img src="{{ page_assets }}/img/logo-datasite-light.svg" style="width: 200px" />
  </div>
  <div class="one-col place-center" style="width: 100%">
    <a href="https://lockhart.dev">lockhart.dev</a>
    <div data-qr-code="{% post_url 2023-05-21-microfrontends-and-module-federation %}" />
  </div>
</div>

</textarea>
</section>
