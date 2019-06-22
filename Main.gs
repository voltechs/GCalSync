/* Globals you really shouldn't touch... */
var start_time=new Date();
var end_time=new Date();
start_time.setDate(start_time.getDate()-days_prior);
end_time.setDate(end_time.getDate()+days_in_advance);

var secondaryCalendar = getSecondaryCalendar();
var primaryCalendar = getPrimaryCalendar();
var userProperties = PropertiesService.getUserProperties();

function is_on_weekday(event) {
  // According to google docs, event.start.dateTime
  // should be a datetime object. Oh well.
  day = new Date(event.start.dateTime).getDay();
  return (day > 0 && day < 6);
}

function is_in_working_hours(event) {
  // TODO: Replace routine after fetching working hours from calendar
  // https://stackoverflow.com/questions/51875481/api-to-get-the-working-hours-data-from-google-calendar-settings
  if (working_hours) {
    start = new Date(event.start.dateTime).getHours();
    return (start >= working_hours.begin && start <= working_hours.end);
  } else {
    return true;
  }
}

function check_confirmed(event) {
  if (only_confirmed && event.attendees) {
    log(event.attendees.length);
    for each (var attendee in event.attendees) {
      if (attendee.email == calendarId) {
        return attendee.responseStatus == 'accepted' || attendee.responseStatus == 'tentative';
      }
    }
    return false;
  } else {
    return true;
  }
}

function should_create_or_update(event) {
  if (weekdays_only && is_on_weekday(event) && is_in_working_hours(event) && check_confirmed(event)) {
    return true;
  } else {
    return false;
  }
}

function sync_lock() {
  lock(sync_lock_seconds, sync);
}

function sync() {
  var secondaryEvents = getCalendarEvents(secondaryCalendar, start_time, end_time);
  var primaryEvents = getCalendarEvents(primaryCalendar, start_time, end_time); // all primary calendar events

  var primaryEventsFiltered = {}; // to contain primary calendar events that were previously created from secondary calendar
  var primaryEventsUpdated = []; // to contain primary calendar events that were updated from secondary calendar
  var primaryEventsCreated = []; // to contain primary calendar events that were created from secondary calendar

  debug('Number of primaryEvents: ' + primaryEvents.length);
  debug('Number of secondaryEvents: ' + secondaryEvents.length);

  // create filtered list of existing primary calendar events that were previously created from the secondary calendar
  for each (var pEvent in primaryEvents)
  {
    if ((tid = getTaggedId(pEvent)) != null) {
      primaryEventsFiltered[tid] = pEvent;
    }
  }

  // process all events in secondary calendar
  for each (var sEvent in secondaryEvents)
  {
    var pEvent = null;
    var sId = sEvent.id;
    var eventData = copyEvent(sEvent);

    // Skip adding non-blocking (free, versus busy) all-day events
    if (sEvent.end.date != null && sEvent.transparency == 'transparent')
    {
      debug("Nonblocking All Day!: " + sEvent.summary + " => " + sEvent.id + " @ " + sEvent.end.date);
      continue;
    }

    if (should_create_or_update(sEvent)) {
      // if the secondary event has already been blocked in the primary calendar, update it
      if ((pEvent = primaryEventsFiltered[sId]) != null)
      {
        delete primaryEventsFiltered[sId];
        debug("Updating: " + sEvent.summary + " => " + sEvent.id + " @ " + sEvent.start.dateTime);
        updateEvent(pEvent, sEvent);
      } else {
        debug("Creating: " + sEvent.summary + " => " + sEvent.id + " @ " + sEvent.start.dateTime);
        pEvent = createEvent(sEvent, primaryCalendar);
      }
    }
  }

  log("Processed Events: " + secondaryEvents.length);

  // if a primary event previously created no longer exists in the secondary calendar, delete it
  for each (var pEvent in primaryEventsFiltered)
  {
    debug("Deleting: " + pEvent.summary + " => " + pEvent.id + " @ " + pEvent.start.dateTime);
    Calendar.Events.remove(primaryCalendar.getId(), pEvent.id);
  }

  log("Deleted Events: " + primaryEventsFiltered.length);
}
