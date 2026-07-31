const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        replaceInDir(fullPath);
      }
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('http://127.0.0.1:4000')) {
        // Replace in normal quotes: "http://127.0.0.1:4000/api" -> `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api`
        content = content.replace(/"http:\/\/127\.0\.0\.1:4000([^"]*)"/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}$1`');
        
        // Replace in backticks: `http://127.0.0.1:4000/api/${id}` -> `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:4000'}/api/${id}`
        content = content.replace(/`http:\/\/127\.0\.0\.1:4000([^`]*)`/g, '`${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000"}$1`');
        
        fs.writeFileSync(fullPath, content);
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

replaceInDir(path.join(__dirname, 'app'));
