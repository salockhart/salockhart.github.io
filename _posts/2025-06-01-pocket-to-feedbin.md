---
title: "Pocket to Feedbin"
---

Mozilla [recently announced](https://support.mozilla.org/en-US/kb/future-of-pocket) that Pocket, their read-it-later service, will be shutting down.

I've used Pocket for years, and the immediate question was where I'd move everything to next. I've used Instapaper in the past, but I decided to take this as an opportunity to go all in on Feedbin, which I've been using for RSS for a while now.

That led to [pocket-to-feedbin](https://github.com/salockhart/pocket-to-feedbin), a small website built with Tanstack Start that allows you to take a Pocket export and add those pages to Feedbin.

The process is fairly straightforward:
1. Export your Pocket data from [the Pocket website](https://getpocket.com/export).
2. Upload the exported file to the pocket-to-feedbin website.
3. The site parses the CSV file using `papaparse`.
4. It then uses the Feedbin API to add each item to your Feedbin account, and marking any archived pages as read.

You can try it out [here](https://pocket-to-feedbin.fly.dev/).
