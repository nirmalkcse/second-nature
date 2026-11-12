---
tags: [second-nature]
max_turns: 40
timeout_seconds: 1200
allowed_tools: [Read, Glob, Grep, Skill, Write, Edit, Bash]
---

For our mobile web music app I need a "now playing" bottom sheet. Collapsed it's a mini-player bar at the bottom of the screen; drag it up and it expands into the full player with artwork (a placeholder is fine), title and artist, a scrubber, play/pause/next, and the up-next queue. It should follow the finger when dragged and also open and close by tapping. Vanilla JS, one index.html, mock data. It needs to feel native on a phone, not like a web page.
