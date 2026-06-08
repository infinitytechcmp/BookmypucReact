const fs = require('fs');
const path = require('path');

const updateDir = (dir) => {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      updateDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Skip files that shouldn't have their h1/h2 replaced automatically
      if (fullPath.includes('gradient-heading.tsx')) return;

      const h1Regex = /<h1\b([^>]*)>([\s\S]*?)<\/h1>/g;
      if (h1Regex.test(content)) {
        content = content.replace(h1Regex, `<GradientHeading level={1}$1>$2</GradientHeading>`);
        changed = true;
      }

      const h2Regex = /<h2\b([^>]*)>([\s\S]*?)<\/h2>/g;
      if (h2Regex.test(content)) {
        content = content.replace(h2Regex, `<GradientHeading level={2}$1>$2</GradientHeading>`);
        changed = true;
      }

      if (changed) {
        if (!content.includes('import { GradientHeading }')) {
          const lastImportIndex = content.lastIndexOf('import ');
          if (lastImportIndex !== -1) {
            const endOfLastImport = content.indexOf('\n', lastImportIndex);
            content = content.slice(0, endOfLastImport + 1) + `import { GradientHeading } from '@/components/ui/gradient-heading';\n` + content.slice(endOfLastImport + 1);
          } else {
            content = `import { GradientHeading } from '@/components/ui/gradient-heading';\n` + content;
          }
        }
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  });
};

updateDir(path.join(__dirname, 'src', 'pages'));
updateDir(path.join(__dirname, 'src', 'components'));
console.log('All headings updated.');
