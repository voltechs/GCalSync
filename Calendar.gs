function getPrimaryCalendar() {
  return CalendarApp.getDefaultCalendar();
}

function getSecondaryCalendar() {
  debug(JSON.stringify(PropertiesService.getUserProperties()));
  debug(JSON.stringify(PropertiesService.getScriptProperties()));
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
