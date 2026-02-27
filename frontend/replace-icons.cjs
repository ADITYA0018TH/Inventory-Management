const fs = require('fs');
const path = require('path');

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("from 'react-icons/fi'") || content.includes('from "react-icons/fi"')) {
        content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"]react-icons\/fi['"];?/g, (match, imports) => {
          const icons = imports.split(',').map(i => i.trim()).filter(i => i);
          const newImports = icons.map(icon => {
            if (icon.startsWith('Fi')) {
              const lucideName = icon.slice(2);
              return `${lucideName} as ${icon}`;
            }
            return icon;
          });
          return `import { ${newImports.join(', ')} } from 'lucide-react';`;
        });
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(__dirname, 'src'));
