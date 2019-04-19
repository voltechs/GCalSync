var calendarId="your.email@some.email.provider.com"; // CHANGE - id of the secondary calendar to pull events from
var days_in_advance = 14; // how many days in advance to monitor and block off time
var days_prior = 7;
var weekdays_only = false;
var color = CalendarApp.EventColor.PALE_RED;

/* Advanced Settings */
var eventPrefix="BOOKED"; // update this to the text you'd like to appear in the new events created in primary calendar
var default_very_private = true;
var sync_lock_seconds = 60;
var logging = false;


/* Globals you really shouldn't touch... */
var start_time=new Date();
var end_time=new Date();
start_time.setDate(start_time.getDate()-days_prior);
end_time.setDate(end_time.getDate()+days_in_advance);

var secondaryCalendar = getSecondaryCalendar();
var primaryCalendar = getPrimaryCalendar();
var userProperties = PropertiesService.getUserProperties();

function log(msg)
{
  if (logging)
  {
    Logger.log(msg);
  }
}

function is_on_weekday(event) {
  var day = event.getStartTime().getDay();
  return (day > 0 && day < 6);
}

function getPrimaryCalendar() {
  return CalendarApp.getDefaultCalendar();
}

function getSecondaryCalendar() {
  Logger.log(JSON.stringify(PropertiesService.getUserProperties()));
  Logger.log(JSON.stringify(PropertiesService.getScriptProperties()));
  return CalendarApp.getCalendarById(calendarID());
}

function calendarID()
{
  return calendarId; //userProperties.getProperty('SyncCalendarID');
}

function tagId() {
  return calendarID(); //userProperties.getProperty('TagID') || userProperties.getProperty('SyncCalendarID')
}

function getTaggedId(event) {
  if (props = event.extendedProperties) {
    if (props.shared) {
      return props.shared[tagId()];
    }
  }

  return null;
}

function getCalendarEvents(calendar, start, end) {
 var response = Calendar.Events.list(calendar.getId(), {
    timeMin: start.toISOString(),
    timeMax: end.toISOString(),
    singleEvents: true
  });
  return response.items;
}

function clearEvents() {
  var primaryCalendar = getPrimaryCalendar();
  for each (var event in getCalendarEvents(primaryCalendar, start_time, end_time)) {
    if ((tagged = getTaggedId(event)) != null) {
      Calendar.Events.remove(primaryCalendar.getId(), event.id);
    }
  }
}

function sync_lock() {
  var lock = LockService.getScriptLock();
  if (lock.tryLock(sync_lock_seconds*1000)) {
    try {
      sync();
    } finally {
      lock.releaseLock();
    }
  } else {
    log('Could not obtain lock after ' + sync_lock_seconds + ' seconds.');
  }
}

function sync() {
  var secondaryEvents = getCalendarEvents(secondaryCalendar, start_time, end_time);
  var primaryEvents = getCalendarEvents(primaryCalendar, start_time, end_time); // all primary calendar events

  var primaryEventsFiltered = {}; // to contain primary calendar events that were previously created from secondary calendar
  var primaryEventsUpdated = []; // to contain primary calendar events that were updated from secondary calendar
  var primaryEventsCreated = []; // to contain primary calendar events that were created from secondary calendar

  log('Number of primaryEvents: ' + primaryEvents.length);
  log('Number of secondaryEvents: ' + secondaryEvents.length);

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
    // if the secondary event has already been blocked in the primary calendar, update it
    if ((pEvent = primaryEventsFiltered[sId]) != null)
    {
      delete primaryEventsFiltered[sId];
      log("Updating: " + sEvent.summary + " => " + sEvent.id + " @ " + sEvent.start.dateTime);
      updateEvent(pEvent, sEvent);
    } else {
      if (!weekdays_only || is_on_weekday(sEvent)) {
        log("Creating: " + sEvent.summary + " => " + sEvent.id + " @ " + sEvent.start.dateTime);
        pEvent = createEvent(sEvent, primaryCalendar);
      }
    }

    // TODO: Handle All-day events
    // if (evi.isAllDayEvent())
    // {
    //   return; // Do nothing if the event is an all-day or multi-day event. This script only syncs hour-based events
    // }
  }

  // if a primary event previously created no longer exists in the secondary calendar, delete it
  for each (var pEvent in primaryEventsFiltered)
  {
    log("Deleting: " + pEvent.summary + " => " + pEvent.id + " @ " + pEvent.start.dateTime);
    Calendar.Events.remove(primaryCalendar.getId(), pEvent.id);
  }
}
