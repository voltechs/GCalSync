// Experimental, not needed
// https://developers.google.com/apps-script/guides/services/advanced
// https://developers.google.com/apps-script/guides/services/advanced#enabling_advanced_services

function getPrimaryCalendarChangedEvents(start, end) {
  var syncToken = userProperties.getProperty('syncToken');
  var request_options = {}
  if (syncToken && typeof syncToken != 'undefined') {
    request_options.syncToken = syncToken;
  } else {
    // Sync events up to thirty days in the past.
    request_options.timeMin = start.toISOString();
  }
  
  try {
    Logger.log("Requesting with: "+JSON.stringify(request_options));
    response = Calendar.Events.list(getPrimaryCalendar().getId(), request_options);
    Logger.log("Setting: "+JSON.stringify(response));
    userProperties.setProperty('syncToken', response.nextSyncToken);
    if (response.items && response.items.length > 0)
    {
      return response.items;
    } else {
      return [];
    }
  } catch (e) {
    // Check to see if the sync token was invalidated by the server;
    // if so, perform a full sync instead.
      userProperties.deleteProperty('syncToken');
      Logger.log("Doing full sync: "+e.message+syncToken);
      return getPrimaryCalendarChangedEvents(start, end);
  }
}



function sync2() {
  var events = getPrimaryCalendarChangedEvents(start_time, end_time);
  Logger.log("HOW MANY: "+events.length);
}