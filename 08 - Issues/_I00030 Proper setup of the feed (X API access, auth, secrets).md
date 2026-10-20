---
file_class: issue
paras:
  - "[[create-a-feed]]"
type: "[[Issues]]"
subtypes:
  - "[[Operational - Issues - task|task]]"
role:
priority: 1
rate:
tags:
status: inbox
maturity: capture
created: 2026-10-18 09:38
dueDate:
dependencies:
---
# [[_I00030 Proper setup of the feed (X API access, auth, secrets)]]

> [!abstract]
> - Set up access to the X API so the feed scripts can read my bookmarks.
> - Without a working token and a safe place for secrets, nothing else in [[create-a-feed]] can run.

## Description

The bookmarks endpoint (`GET /2/users/:id/bookmarks`) needs OAuth 2.0 user context with the `bookmark.read` scope. Done means a script run returns my latest bookmarks without manual steps, and no secret lives in the vault or in git.

## Tasks

- [ ] Create the X developer app and enable OAuth 2.0 with PKCE
  - Scopes: `bookmark.read`, `tweet.read`, `users.read`, `offline.access`
  - Check the API tier and the read limits for bookmarks
- [ ] Decide where the secrets live
  - Env file outside the vault or the macOS keychain
  - Add the path to `.gitignore` if it is inside the repo
- [ ] Do the first authorization and store the refresh token
- [ ] Handle token refresh in the script
- [ ] Document the setup as a how-to


## Post-Mortem

- We have added this to the logging? (project journal: `journal.sh log --kind done --link "[[...]]"`)
- Objective moved:
- Good things:
- Bad Things:
- Rate (1-3):
- Notes to create?
	- Ending note: core note/index that builds the final solution
	- Reusable in other places
	- Tech debt
	- Review of the resources & tools used
	- Additional requirements
	- Ideas