function log(msg)
{
  if (logging)
  {
    Logger.log(msg);
  }
}

function debug(msg)
{
  if (debuging)
  {
    Logger.log(msg);
  }
}

function warn(msg)
{
  if (warning)
  {
    Logger.log(msg);
  }
}

function retry(max, func) {
  for (var n=0; n<=max; n++) {
    try {
      return func();
    } catch(e) {
      Utilities.sleep((Math.pow(2,n)*2000) + (Math.round(Math.random() * 2000)));
    }
  }
}

function lock(timeout, func) {
  try {
    var lock = LockService.getScriptLock();
    if (lock.tryLock(timeout*1000)) {
      try {
        func();
      } finally {
        lock.releaseLock();
      }
    } else {
      warn('Could not obtain lock after ' + timeout + ' seconds.');
    }
  } catch (e) {
    warn('Could not obtain lock service.');
  }
}
