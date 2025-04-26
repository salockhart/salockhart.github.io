---
layout: page
title: Home
id: home
permalink: /
---

<style>
  .future {
    opacity: 0.5;
  }
  .coming-soon {
    font-size: .5em;
    padding: .25em;
    border: 1px solid gray;
    border-radius: 5px;
    position: relative;
    bottom: .25em;
    margin: .25em;
  }
</style>

<ul>
  {% assign recent_posts = site.posts | sort: "date" | reverse %}
  {% for post in recent_posts limit: 5 %}
    <li data-post-date="{{ post.date | date_to_rfc822 }}">
      {{ post.date | date: "%Y-%m-%d" }} — <a href="{{ post.url }}">{{ post.title }}</a>
    </li>
  {% endfor %}
</ul>

<script>
  // if there is not a "force" query param, hide the future posts
  const urlParams = new URLSearchParams(window.location.search);
  const force = urlParams.get('force');
  if (!force) {
    document.querySelectorAll('[data-post-date]').forEach((el) => {
      const date = new Date(el.dataset.postDate);
      const now = new Date();
      if (date > now) {
        el.classList.add('future');
        const link = el.querySelector('a');
        link.replaceWith(link.innerText);
        
        const pill = document.createElement("span");
        pill.classList.add("coming-soon");
        pill.innerText = "Coming Soon";
        el.appendChild(pill);
      }
    });
  }
</script>
