const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('layout/GuestUpsell')) {
        content = content.replace(/layout\/GuestUpsell/g, 'shared/GuestUpsell');
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

processDir('./src');
