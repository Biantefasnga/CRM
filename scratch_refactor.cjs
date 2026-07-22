const fs = require('fs');
const path = require('path');

const appTsxPath = path.join(__dirname, 'src/app/App.tsx');
let content = fs.readFileSync(appTsxPath, 'utf8');

// 1. Add imports
if (!content.includes('import { DataProvider, useData }')) {
  content = content.replace(
    "import React, { useState, useMemo } from \"react\";",
    "import React, { useState, useMemo } from \"react\";\nimport { DataProvider, useData } from './lib/dataContext';"
  );
}

// 2. Remove mock data constants
// They start around line 40 with `const USERS = [` and end around line 221 with `];` for ACTIVITIES
// We can use a regex to match `const USERS = [ ... ];`
// A safer way is to just replace everything from `const USERS = [` up to `// ─── Helpers ───` with nothing.
const helpersIndex = content.indexOf('// ─── Helpers ───');
const usersIndex = content.indexOf('const USERS = [');

if (usersIndex !== -1 && helpersIndex !== -1) {
  content = content.substring(0, usersIndex) + content.substring(helpersIndex);
}

// 3. Inject useData hook into components
const viewsToUpdate = [
  'Overview',
  'ClientsView',
  'PipelineView',
  'QuotationsView',
  'TATView',
  'ActivityView'
];

viewsToUpdate.forEach(view => {
  const funcRegex = new RegExp(`(function ${view}\\([^\\)]*\\)\\s*\\{)`);
  if (content.match(funcRegex)) {
    content = content.replace(
      funcRegex,
      `$1\n  const { users: USERS, clients: CLIENTS, deals: DEALS, quotations: QUOTATIONS, samples: SAMPLES, activities: ACTIVITIES } = useData();`
    );
  }
});

// 4. Wrap App with DataProvider
// Replace the return block in function App
if (content.includes('export default function App() {') && !content.includes('<DataProvider>')) {
  // Find where function App is
  const appIndex = content.indexOf('export default function App() {');
  // Find the return statement inside App
  const returnIndex = content.indexOf('return (', appIndex);
  
  if (returnIndex !== -1) {
    // Replace the opening parenthesis with <DataProvider>
    content = content.replace(
      'return (',
      'return (\n    <DataProvider>'
    );
    // Replace the final ); with </DataProvider>);
    const lastIndex = content.lastIndexOf(');');
    content = content.substring(0, lastIndex) + '\n    </DataProvider>\n  );' + content.substring(lastIndex + 2);
  }
}

fs.writeFileSync(appTsxPath, content);
console.log('Refactoring complete!');
