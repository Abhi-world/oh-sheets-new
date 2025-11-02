# Google Sheets Re-consent Guide

## Why You Need to Re-consent

Recent updates to the Oh Sheets app have improved Google Sheets integration with:
- Fixed scope string format
- Enhanced Drive API query parameters to include shared drives
- Improved dropdown functionality for spreadsheet selection

To benefit from these improvements, you need to re-consent to the Google Sheets integration with the correct scopes.

## Re-consent Steps

1. **Remove Current Permissions**
   - Go to [Google Account Permissions](https://myaccount.google.com/permissions)
   - Find "Oh Sheets" in the list of connected apps
   - Click on it and select "Remove Access"

2. **Reconnect in the App**
   - Return to the Oh Sheets app
   - Click on "Connect to Google Sheets" button
   - Follow the Google authentication flow
   - Ensure you approve both required scopes:
     - `https://www.googleapis.com/auth/spreadsheets` (for reading/writing to spreadsheets)
     - `https://www.googleapis.com/auth/drive.readonly` (for listing spreadsheets, including shared ones)

3. **Verify Connection**
   - After reconnecting, open any dropdown that lists spreadsheets
   - You should now see all your spreadsheets, including those in shared drives
   - If you still don't see your spreadsheets, check the browser console for any errors

## Troubleshooting

If you encounter issues after re-consenting:

1. **Clear Browser Cache**
   - Clear your browser cache and cookies
   - Try reconnecting again

2. **Check Network Requests**
   - Open browser DevTools (F12 or right-click → Inspect)
   - Go to Network tab
   - Filter by "gs-list-spreadsheets"
   - Open the dropdown to list spreadsheets
   - Verify a request appears and returns a 200 status code

3. **Still Having Issues?**
   - Contact support with screenshots of any error messages
   - Include the time when you attempted to reconnect

## What's Changed

- **Scope String Format**: Fixed to use proper space-separated URL format instead of Markdown links
- **Drive API Query**: Enhanced to include shared drives with parameters like `supportsAllDrives` and `includeItemsFromAllDrives`
- **Dropdown Functionality**: Improved to properly call the spreadsheet listing function