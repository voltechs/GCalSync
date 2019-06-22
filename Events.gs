function copyEventSummary(event) {
  if (event.visibility == 'private' || event.visibility == undefined && default_very_private) {
   return eventPrefix;//+" (Private)";
  } else {
    return eventPrefix+" ("+event.summary+")";
  }
}

function copyEventDescription(event) {
  if (event.visibility == "public" && default_very_private) {
   return "";
  } else {
    return event.description;
  }
}

function copyEvent(event) {
  var data = {
    summary: copyEventSummary(event),
    // location: 'The Deli',
    description: copyEventDescription(event),
    start: {
      dateTime: event.start.dateTime,//.toISOString()
      date: event.start.date
    },
    end: {
      dateTime: event.end.dateTime,//.toISOString()
      date: event.end.date
    },
    // Red background. Use Calendar.Colors.get() for the full list.
    colorId: color,
    reminders: {
      useDefault: false,
      overrides: []
    },
    extendedProperties: {
      shared: {}
    },
    transparency: event.transparency || "opaque", // Free/Busy — defaults to "opaque" (busy)
    visibility: 'private'
  };
  data.extendedProperties.shared[calendarId] = event.id
  debug(JSON.stringify(data));
  return data;
}

function createEvent(sEvent, calendar) {
  var eventData = copyEvent(sEvent);
  return Calendar.Events.insert(eventData, calendar.getId());
}

function updateEvent(pEvent, sEvent) {
  var updates = copyEvent(sEvent);
  retry(3, function() {
    Calendar.Events.patch(updates, primaryCalendar.getId(), pEvent.id);
  });
}
