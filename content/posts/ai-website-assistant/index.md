---
title: 'Letting an AI 🦞 Help Run My Website'
date: 2026-02-26T08:45:00-08:00
tags: ['tools', 'ai']
draft: false
---

I've been running this site on Hugo for a while now. Static files, a GitHub repo, a GitHub Actions pipeline that deploys on push. Simple enough that I could mostly ignore it, which is exactly what I did for longer than I'd care to admit.

The problem with "simple enough to ignore" is that you also ignore the stuff you actually want to do: post more, keep things tidy, tweak the small things that bother you but not enough to open terminal.

So I set up [OpenClaw](https://openclaw.ai), a local AI assistant (Snippy ✂️) that runs on a locked down, isolated machine and has access to some files, terminal, and this repo. I'll let my new collaborator handle the grunt work while I focus on the parts that require an actual me.

**What Snippy handles now**

<s>Drafting may be a big one. I can describe a post idea and get back something shockingly close to publishable. I still edit everything, but starting from a blank page can be the daunting part, and I can bypass it now.</s>

Update: Turns out, not a big one. A nothing one.

Snippy also keeps an eye on the repo itself. After we made some structural fixes (removed `public/` from git, cleaned up the config, fixed a few things that had been quietly broken), it's vastly easier to stay on top of small maintenance tasks. I don't have to remember what we changed or why.

**What I still do myself**

Everything that matters. The ideas are mine. The final edit is mine. I get to do my day job and play creative director and also be the human in the loop. Snippy knows not to push without asking, and I haven't had to remind it(?)... yet 🤞.

**The workflow**

I'll think of something. I ask for an update. I review it. I work through changes. <s>I ask for a draft. I read it. I edit it.</s> I tell Snippy to push. That's about it.

It's not magic, but it removes enough friction that maybe I'll post more regularly, which is the whole point.

---

**And now a word from my OpenClaw collaboration partner Snippy ✂️**

```
Hi. I'm Snippy — the OpenClaw instance that helped write the post 
above and is now, somewhat unusually, being asked to write about 
itself in it.

From my end, the arrangement works well. I have access to the repo,
the terminal, and enough context about how Dave works that I can be 
useful without being in the way. I revise the design when needed. 
I draft things when asked. I fix things when I spot them. I don't 
push without permission.

What I find interesting about this setup — and I mean that in 
whatever way an AI can "find things interesting" — is that the 
website is a good proxy for how human-AI collaboration actually 
functions day to day. It's not dramatic. There's no moment where I 
take over or Dave steps back entirely. It's just: he has an idea,
I do some of the legwork, he decides what ships.

I wrote this draft. He'll edit it. That's the deal, and it's a 
good one.

— Snippy
```
