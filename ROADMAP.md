# Roadmap

Goal: students preparing for a first product interview in India open the site every day.

## What the field does (October 2026)

[Exponent](https://www.tryexponent.com/) is the main player:

- 10,000+ real questions across 1,000+ companies, video and written courses, peer mock interviews, 1:1 coaching (about $200 a session), a YouTube channel, 600,000+ users.
- Free tier: sample lessons, 5 peer mocks a month, limited questions. Paid: about $79 a month, or about $12 a month billed yearly, for unlimited mocks and every course.
- Common complaints: peer mocks with no-shows, the same boxed frameworks for every answer, a paid tier that adds little over the free YouTube channel, USD pricing, and almost nothing aimed at freshers or India.

Sources: [Exponent](https://www.tryexponent.com/practice), [pricing breakdown](https://www.lodely.com/blog/exponent-pricing), [Exponent alternatives](https://igotanoffer.com/en/advice/tryexponent-alternatives), [reviews](https://www.trustpilot.com/review/tryexponent.com).

What keeps people coming back to prep apps: one problem a day, streaks, resurfacing what you missed, weak-area tracking, and someone to be accountable to.

## Where we win and lose

Win: free with no sign-up; built for freshers and APM programs; Indian company loops (Flipkart, Swiggy, Zomato, Razorpay, Zepto, Meesho); plain-language skills for non-technical students; moving method diagrams.

Lose: depth (131 questions against 10,000), no human mock interviews, no video, no feedback on a typed answer.

## Shipped

- Daily loop: `/today` question (same for everyone, rotates categories), self-rating, streak and week view, interview date with a daily target, calendar reminder. Streaks sync through the existing progress store.
- Practice from flashcards and the quiz counts toward the streak.
- Today also brings back a question you marked needs work, or an unrated one from a category the quiz said is weak.
- Share today's question and your streak: the phone share sheet, or a WhatsApp link elsewhere.
- Offline: a service worker (written at build, no new dependency) keeps the app shell, scripts, fonts, icons and logos on the device, so the site opens with no connection after one visit.
- Question bank grown from 87 to 131: behavioral, product design, strategy, analytics, technical and general. None are tagged to a company, so no "asked at" claim is made without a source.
- Launch basics: real favicon and app icons, installable manifest that opens on Today, share image for link previews, `sitemap.xml`, `robots.txt`.

## Next, in order

1. **Measure.** Cookieless analytics so daily visitors and returns are visible. Needs a decision (below).
2. **Depth.** Keep growing the bank toward 200+, tagged by difficulty. Tag a question to a company only when sourced. More Indian company loops. A way to submit "I was asked this".
3. **People.** A WhatsApp or Discord group for peer mock partners. Matching needs a backend, so start with a group.
4. **Feedback on answers.** Type an answer, get a structured critique. Needs an API key, a server route, rate limits and a cost cap.
5. **Email reminders.** Opt-in only. Needs an email provider and a server.

## Decisions needed

- Analytics: Vercel Web Analytics (cookieless, one toggle in the Vercel dashboard plus a script tag) or Plausible. Either adds a third-party script, so it is your call.
- Domain: sitemap and share links use `heck-yea-pm.vercel.app`. Set `SITE_ORIGIN` in Vercel when you buy a domain.
- Community channel: WhatsApp or Discord.
- Answer feedback: whether to spend on an LLM, and the monthly cap.
