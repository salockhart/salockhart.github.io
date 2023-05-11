---
layout: page
title: Home
id: home
permalink: /
---

<ul>
  {% assign recent_posts = site.posts | sort: "date" | reverse %}
  {% for post in recent_posts limit: 5 %}
    <li>
      {{ post.date | date: "%Y-%m-%d" }} — <a class="internal-link" href="{{ post.url }}">{{ post.title }}</a>
      {{ page.excerpt }}
    </li>
  {% endfor %}
</ul>
