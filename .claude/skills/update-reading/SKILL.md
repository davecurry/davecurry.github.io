---
name: update-reading
description: Sync content/pages/reading/index.md with Dave's Goodreads activity — updates the "Currently Reading" hero book and adds newly-finished books to the current year's book list. Use when Dave asks to update, sync, refresh, or check his reading page against Goodreads.
---

# Update Reading Page from Goodreads

Goodreads user id: **1435201** (public shelves, no login needed via RSS).

## 1. Pull the two feeds

- Currently reading: `https://www.goodreads.com/review/list_rss/1435201?shelf=currently-reading`
- Read, newest first: `https://www.goodreads.com/review/list_rss/1435201?shelf=read&sort=date_read&order=d`

Use `WebFetch` on each — they're plain RSS/XML and don't require authentication. Each entry includes title, author, a link to the book's Goodreads page, and (on the read feed) a `date_read`.

## 2. Read the current state

Read `content/pages/reading/index.md`. Note:
- The current hero book (title + Goodreads URL, right under "Last Updated")
- Every book already listed under the current year's `### {YEAR} Book List` heading — identify each by its Goodreads book ID (the numeric prefix in its URL), not just title text, so near-duplicate titles don't cause false negatives.

## 3. Diff

- **Hero changed?** If the currently-reading feed's top entry has a different Goodreads book ID than the site's hero, the book has changed.
  - If the *old* hero book now appears on the read feed with a `date_read` in the current calendar year, it needs to move: add it to the top of the current year's book list (see template below), then replace the hero block with the new book.
  - If the old hero isn't on the read feed yet (reader abandoned it, or Goodreads hasn't synced), ask Dave before removing it — don't silently drop a book he might still be reading elsewhere.
- **New finishes?** Walk the read feed's entries with `date_read` in the current calendar year. For any not already present in the year's list (by Goodreads book ID) and not the just-moved former hero, add them — newest `date_read` at the top of the list, preserving Goodreads' ordering.
- Leave every existing entry's markup untouched. Only insert new blocks; never rewrite descriptions or reorder books already on the page.

## 4. Fetch cover art for anything new

For each new/changed book, `WebFetch` its Goodreads page for the cover image URL, confirm author(s) and first-publication year. Derive the small list-thumbnail URL by swapping the cover's `i.gr-assets.com`/`m.media-amazon.com` filename suffix to `._SY75_.jpg` (matches the pattern already used throughout the file) for list entries; use the full-size cover URL for the hero image.

## 5. Apply edits using the existing templates

Hero block (top of file):
```html
<div style="text-align: center; margin: 2rem 0 1.5rem;">
  <a href="{GOODREADS_URL}">
    <img src="{FULL_COVER_URL}"
         alt="{TITLE} by {AUTHOR}"
         style="display: block; margin: 0 auto; max-width: 320px; width: 100%; box-shadow: 0 8px 40px rgba(0,0,0,0.35); border-radius: 4px;">
  </a>
</div>

<div style="text-align: center; margin-bottom: 2rem;">

[***{TITLE}***]({GOODREADS_URL})

({YEAR}) {AUTHOR}
</div>
```

Year-list entry:
```html
<div style="display: flex; align-items: flex-end; gap: 8px;">
<img src="{SY75_THUMB_URL}" alt="{TITLE}" style="float: left; margin-right: 16px;">

[*{TITLE}*{ — SERIES, #N if applicable}]({GOODREADS_URL}) ({YEAR}) {AUTHOR}

</div>
```

## 6. Update the date line

Set `Last Updated:` (near the top of the file) to **today's actual date** — check it explicitly (e.g. via `date`), don't infer it from other dates already in the file or recent edits. Getting this wrong has happened before.

## 7. Handle year rollover (rare, check when relevant)

If today's year is past the current `### {YEAR} Book List` heading's year, add a new heading for the new year above it and start the new year's list there — don't touch the prior year's section, it stays as history.

## 8. Stop before publishing

Apply the file edit and let Dave review (dev server, or just describe the change). **Do not `git add`/commit/push as part of this routine** — that only happens when Dave separately says so, same as every other change to this site.
