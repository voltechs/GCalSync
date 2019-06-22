var calendarId="your.email@some.email.provider.com"; // CHANGE - id of the secondary calendar to pull events from
var days_in_advance = 14; // how many days in advance to monitor and block off time
var days_prior = 7;
var weekdays_only = true;
var color = CalendarApp.EventColor.PALE_RED;
// Set to false, or use 24-hour hours
// Currently need to adjust for daylight savings
var working_hours = {
  begin: 6, // 7
  end: 19 // 20
}
// Only show confirmed events
var only_confirmed = true;

/* Advanced Settings */
var eventPrefix="Blocked"; // update this to the text you'd like to appear in the new events created in primary calendar
var default_very_private = false;
var sync_lock_seconds = 60;
var logging = true;
var warning = true;
var debuging = false;

function main() {
  sync_lock();
}
