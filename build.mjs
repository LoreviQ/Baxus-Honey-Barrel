// build.mjs
import * as esbuild from 'esbuild';
import { cp } from 'node:fs/promises'; // Use Node's built-in file copy
import { glob } from 'glob'; // Import glob

const isWatchMode = process.argv.includes('--watch');
const outdir = 'dist';

// Find content scripts - update pattern to include subdirectories
const contentScripts = glob.sync('src/content_scripts/**/*.ts'); // Find .ts files in content_scripts and subdirs

// --- esbuild configuration ---
const esbuildOptions = {
  entryPoints: [
    'src/background/service-worker.ts',
    ...contentScripts, // Add discovered content scripts (includes whiskeyGoggles.ts)
    'src/popup/popup.tsx',
    // Add other entry points if you have them:
  ],
  bundle: true, // Enable bundling (follow imports and include dependencies)
  outdir: outdir, // Output directory ('dist')
  sourcemap: true, // Generate source maps for debugging
  platform: 'browser', // Target environment
  format: 'esm', // Output format: ES Modules (required for service worker with "type": "module")
  target: 'es2020', // Target JS version (align with tsconfig.json)
  // If using React/JSX, uncomment and configure:
  jsx: 'automatic', // or 'transform' + jsxFactory/jsxFragment
  loader: { '.tsx': 'tsx', '.ts': 'ts' }, // Ensure .ts loader is present
};

// --- Function to copy static files ---
async function copyStaticFiles() {
  try {
    await cp('manifest.json', `${outdir}/manifest.json`);
    await cp('assets', `${outdir}/assets`, { recursive: true });
    await cp('src/content_scripts/whiskeyGoggles.css', `${outdir}/content_scripts/whiskeyGoggles.css`);
    await cp('src/popup/popup.css', `${outdir}/popup/popup.css`);
    await cp('src/popup/popup.html', `${outdir}/popup/popup.html`);


    console.log('Static files copied successfully.');
  } catch (error) {
    console.error('Error copying static files:', error);
    process.exit(1);
  }
}

// --- Build or Watch ---
async function build() {
  try {
    // Ensure outdir structure matches expected paths in manifest.json
    // esbuild automatically creates subdirectories based on entry point paths relative to a common ancestor
    // or you might need to adjust outbase if structure isn't matching.
    // For this setup, esbuild should place outputs like:
    // dist/background/service-worker.js
    // dist/content_scripts/thewhiskyexchange.js
    // dist/content_scripts/whiskeyGoggles.js
    // dist/popup/popup.js

    const context = await esbuild.context(esbuildOptions);

    if (isWatchMode) {
      console.log('Starting esbuild watch...');
      await context.watch();
      console.log('Watching for changes...');
      await copyStaticFiles(); // Copy static files initially
    } else {
      console.log('Building with esbuild...');
      await context.rebuild();
      await context.dispose(); // Dispose context after build
      console.log('esbuild build complete.');
      await copyStaticFiles(); // Copy static files after build
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}


build(); // Run the build function