# CMVR PDF Live Preview

## Quick Start

### Option 1: Live Preview with Auto-Reload (Recommended)

1. **Start your development server** (in one terminal):

   ```bash
   npm run start:dev
   ```

2. **Start the preview watcher** (in another terminal):

   ```bash
   npm run cmvr:preview
   ```

   This will:
   - ✅ Auto-open your browser to http://localhost:3000/cmvr/preview/general-info
   - ✅ Watch for changes in `cmvr-pdf-generator.service.ts`
   - ✅ Show you when to refresh your browser

3. **Edit the PDF generator**:
   - Open `src/cmvr/cmvr-pdf-generator.service.ts`
   - Make your changes
   - Save the file (Ctrl+S)
   - Refresh your browser to see the updated PDF!

### Option 2: Direct Browser Preview

Just open this URL in your browser:

```
http://localhost:3000/cmvr/preview/general-info
```

Refresh the page (F5) after making changes to see the updates.

---

## How It Works

### Preview Endpoint

- **URL**: `GET /cmvr/preview/general-info`
- **No database needed**: Uses mock data built into the controller
- **Fast**: Regenerates PDF instantly on each request
- **Browser-friendly**: Opens directly in your browser (inline display)

### Mock Data Location

The mock data is defined in `src/cmvr/cmvr.controller.ts` in the `previewGeneralInfoPdf()` method.

You can edit the mock data there if you want to test different values without touching the database.

---

## Development Workflow

### Typical workflow:

1. Run `npm run start:dev` (starts NestJS server with hot-reload)
2. Run `npm run cmvr:preview` (opens browser and watches for changes)
3. Edit `src/cmvr/cmvr-pdf-generator.service.ts`
4. Save your changes
5. Refresh browser to see the PDF update
6. Repeat steps 3-5 until satisfied

### What the watcher does:

- Monitors `cmvr-pdf-generator.service.ts` for file changes
- Logs when changes are detected
- Tells you when to refresh your browser
- Auto-opens browser on first run (Windows)

---

## Tips for Faster Development

### 1. Use Multiple Monitors

- One screen: VS Code with the PDF generator service
- Another screen: Browser with the preview URL open

### 2. Browser Auto-Refresh Extension

Install a browser extension like "Auto Refresh" to automatically reload the page every 2-3 seconds:

- Chrome: [Auto Refresh Plus](https://chrome.google.com/webstore/detail/auto-refresh-plus/oilipfekkmncanaajkapbpancpelijih)
- Firefox: [Auto Refresh](https://addons.mozilla.org/en-US/firefox/addon/auto-refresh/)

### 3. Use Browser DevTools

Open DevTools (F12) and:

- Disable cache: Network tab → "Disable cache" checkbox
- Zoom: Use Ctrl + Mouse Wheel to zoom the PDF

### 4. Quick Edit Shortcuts

Common PDF changes:

- **Add text**: `doc.text('Your text', x, y, options)`
- **Change font**: `doc.font('Helvetica-Bold').fontSize(12)`
- **Add spacing**: `doc.moveDown(0.5)` or `doc.moveDown(1)`
- **Bold + Regular**: `doc.font('Helvetica-Bold').text('Label: ', {continued: true}).font('Helvetica').text('value')`

---

## Comparing with Database Data

### Preview vs Real Data

- **Preview**: `/cmvr/preview/general-info` - Uses mock data
- **Real**: `/cmvr/:id/pdf/general-info` - Uses database data

To test with real database data:

1. Seed sample data: `npx ts-node scripts/seed-cmvr-sample.ts`
2. Copy the ID from the output
3. Open: `http://localhost:3000/cmvr/{paste-id-here}/pdf/general-info`

---

## Troubleshooting

### Browser doesn't open automatically

- Manually open: http://localhost:3000/cmvr/preview/general-info

### PDF doesn't update after changes

- Make sure `npm run start:dev` is running
- Refresh your browser (F5)
- Check the terminal for any compilation errors

### Port 3000 already in use

- Kill the process using port 3000
- Or change the port in `src/main.ts`

---

## Advanced: Customize Mock Data

Edit the mock data in `src/cmvr/cmvr.controller.ts`:

```typescript
@Get('preview/general-info')
async previewGeneralInfoPdf(@Res() res: Response) {
  const mockGeneralInfo = {
    companyName: 'Your Company Name Here',  // ← Edit this
    quarter: '4th',                          // ← Edit this
    year: 2025,                              // ← Edit this
    // ... edit any field
  };
  // ...
}
```

Save the file and refresh your browser to see the changes.
