function doPost(e) {
  try {
    const properties = PropertiesService.getScriptProperties();
    const expectedSecret = properties.getProperty('SHEETS_SHARED_SECRET');
    const spreadsheetId = properties.getProperty('SPREADSHEET_ID');

    if (!expectedSecret || !spreadsheetId) {
      throw new Error('Apps Script is missing SHEETS_SHARED_SECRET or SPREADSHEET_ID');
    }

    const data = JSON.parse(e.postData.contents);
    if (!data || data.secret !== expectedSecret) {
      return jsonResponse({ success: false, message: 'Unauthorized' });
    }

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
      const sheetName = properties.getProperty('SHEET_NAME') || 'Contact Messages';
      const sheet = spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);

      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Received At', 'Name', 'Email', 'Subject', 'Message']);
      }

      sheet.appendRow([
        safeCell(data.receivedAt),
        safeCell(data.name),
        safeCell(data.email),
        safeCell(data.subject),
        safeCell(data.message)
      ]);
    } finally {
      lock.releaseLock();
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Unable to save contact submission:', error);
    return jsonResponse({ success: false, message: 'Unable to save the contact submission' });
  }
}

function safeCell(value) {
  const text = value == null ? '' : String(value);
  return /^[\s]*[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
