// build.mjs
import * as esbuild from 'esbuild';
import { cp } from 'node:fs/promises'; // Use Node's built-in file copy
import { glob } from 'glob'; // Import glob

const isWatchMode = process.argv.includes('--watch');
const outdir = 'dist';

// Find content scripts
const contentScripts = glob.sync('src/content_scripts/**/*.ts'); // Adjust pattern if needed (e.g., .js)

// --- esbuild configuration ---
const esbuildOptions = {
  entryPoints: [
    'src/background/service-worker.ts',
    ...contentScripts, // Add discovered content scripts
    // Add other entry points if you have them:
    // 'src/popup/popup.tsx', // Example if using React/JSX
    // 'src/options/options.html', // esbuild can process HTML too, or copy it
  ],
  bundle: true, // Enable bundling (follow imports and include dependencies)
  outdir: outdir, // Output directory ('dist')
  sourcemap: true, // Generate source maps for debugging
  platform: 'browser', // Target environment
  format: 'esm', // Output format: ES Modules (required for service worker with "type": "module")
  target: 'es2020', // Target JS version (align with tsconfig.json)
  // If using React/JSX, uncomment and configure:
  // jsx: 'automatic', // or 'transform' + jsxFactory/jsxFragment
  // loader: { '.js': 'jsx' }, // Example if mixing JS/JSX
};

// --- Function to copy static files ---
async function copyStaticFiles() {
  try {
    await cp('manifest.json', `${outdir}/manifest.json`);
    await cp('assets', `${outdir}/assets`, { recursive: true });

    // Copy popup HTML/CSS if they exist and aren't handled by esbuild
    // await cp('public/popup.html', `${outdir}/popup.html`);
    // await cp('public/popup.css', `${outdir}/popup.css`);

    // Copy any other static assets
    // ...

    console.log('Static files copied successfully.');
  } catch (error) {
    console.error('Error copying static files:', error);
    process.exit(1);
  }
}

// --- Build or Watch ---
async function build() {
  try {
    const context = await esbuild.context(esbuildOptions);

    if (isWatchMode) {
      console.log('Starting esbuild watch...');
      await context.watch();
      console.log('Watching for changes...');
      // Also copy static files initially in watch mode
      await copyStaticFiles();
      // In a real watch mode, you might want to re-copy static files on change too,
      // but for simplicity here, we do it once at the start.
      // Or use a library like 'chokidar' to watch static files separately.
    } else {
      console.log('Building with esbuild...');
      await context.rebuild();
      await context.dispose(); // Dispose context after build
      console.log('esbuild build complete.');
      // Copy static files after build completes
      await copyStaticFiles();
    }
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build(); // Run the build function