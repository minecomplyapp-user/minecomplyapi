import { watch } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve } from 'path';

const execAsync = promisify(exec);

const WATCH_FILE = resolve(
  __dirname,
  '../src/cmvr/cmvr-pdf-generator.service.ts',
);
const PREVIEW_URL = 'http://localhost:3000/api/cmvr/preview/general-info';

console.log('🔍 Watching for changes in cmvr-pdf-generator.service.ts...');
console.log('📄 Preview URL:', PREVIEW_URL);
console.log('💡 Open the URL in your browser to see live updates\n');

let isGenerating = false;

// Auto-open browser on first run (Windows)
try {
  exec(`start ${PREVIEW_URL}`);
  console.log('✅ Opened preview in browser\n');
} catch {
  console.log('ℹ️  Please open:', PREVIEW_URL, '\n');
}

watch(WATCH_FILE, async (eventType) => {
  if (eventType === 'change' && !isGenerating) {
    isGenerating = true;
    console.log('🔄 Change detected! Reloading preview...');

    try {
      // Wait a bit for the file to be fully saved
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log('✅ PDF regenerated! Refresh your browser to see changes.');
      console.log(`   ${new Date().toLocaleTimeString()}\n`);
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      isGenerating = false;
    }
  }
});

console.log('Press Ctrl+C to stop watching...\n');
