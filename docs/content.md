# Managing content and access

## Clubs

The backend stores clubs and sanitises their text; run its `clubs:migrate` migration before using club editing. Until then the console shows `ClubsSetupRequired`. Clubs live only in the shared database; nothing is scraped from websites.

- The global German/English switch selects the language you edit. A missing translation shows the available language, and saving creates the current one.
- Descriptions support headings, emphasis, lists, safe links and images. The backend derives a plain-text description for older app versions.
- All translations of a club share one version, so if someone else changes it you must reload before saving. Deleting a club removes every translation.
- Unsaved drafts survive language switches, and leaving the page asks for confirmation.
- Images are uploaded as soon as they are selected; an abandoned draft leaves its image in the gallery.

## Quick Links

Ops and administrator accounts manage `/quick-links`: bilingual titles, HTTPS URLs, an icon, order and visibility. Saving publishes the directory to the app immediately. Link IDs stay stable, and a concurrent change is rejected without clearing your edits.

Before first use, run `bun run quick-links:migrate` in the backend against the intended database. Until the backend endpoint is available, the app keeps its bundled links.

## Marketplace moderation

The marketplace pages list posts and reports and manage blocks. The backend's `marketplace:migrate` migration must have been applied.

## Access and maintenance

- Keep bootstrap access and recovery under club control, ideally with more than one maintainer.
- Remove departing maintainers from both delegated roles and the backend's bootstrap list.
- Rotating `SESSION_SECRET` signs everyone out of the console; backend sessions must be revoked separately.
- Keep database, email, domain and repository recovery details in a password manager.

The language switch changes labels and date formats; it does not translate content you enter. Add German labels and their English mapping together in `src/lib/translations.json`. Lists are limited to 500 records; the audit log is paginated.
