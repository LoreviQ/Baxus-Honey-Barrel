# Planned project structure

.
├── manifest.json               # Core extension configuration 
├── package.json                # NPM dependencies and scripts
├── tsconfig.json               # (If using TypeScript) TypeScript config
├──.gitignore                   # Specifies intentionally untracked files
├── README.md                   # Project overview, setup, usage 
│
├── assets/                     # Static assets like icons
│   └── icons/
│       ├── icon16.png
│       ├── icon48.png
│       └── icon128.png
│
├── src/                        # Source code directory (or use root)
│   ├── background/
│   │   └── service-worker.ts   # Background service worker logic 
│   │
│   ├── content_scripts/
│   │   ├── scraper.ts          # Generic scraping logic (if possible)
│   │   └── site_specific/      # Or scripts per site
│   │       ├── thewhiskyexchange.ts
│   │       └──...
│   │
│   ├── popup/
│   │   ├── popup.html          # Popup UI structure
│   │   ├── popup.css           # Popup UI styles
│   │   └── popup.ts            # Popup UI logic and communication
│   │
│   ├── types/                  # types
│   │   └──...
│   │
│   └── utils/                  # utility functions
│       └──...
│
└── dist/                       # Compiled JavaScript output
