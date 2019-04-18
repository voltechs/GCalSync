# Calendar Sync
Copyright: Dale Stevens 2018

## About:
The script below will pull events from the calendar of your choice, and add them to the
primary calendar of the account you employ this script under.
There are a couple "knobs" (variables) at the top of the script to assist in tweeking
to your liking.

## Setup:
- Go to your Google Drive under your desired account (I recommend your "work" account).
- Create a new Google Apps Script under "more". (you may need to "enable" this service by going to "connect more apps")
- Paste the code into script files in the project.
- Setup triggers to run `sync_lock`. (Click the "clock" icon)
  - Setup a timed trigger (every 15-30 minutes or so)
  - Setup an event trigger (on update from your personal calendar)
- Run.
- You may need be prompted to authorize and sign-in to your account. Do this for your primary calendar (the account you're on)
 ## Todo:
 - https://developers.google.com/apps-script/advanced/calendar#listing_events
 - https://developers.google.com/calendar/v3/sync
 - https://developers.google.com/apps-script/guides/services/advanced
 - https://developers.google.com/apps-script/guides/services/advanced#enabling_advanced_services
