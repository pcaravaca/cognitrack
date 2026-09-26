const fs = require('fs');

function findDuplicateKeys(obj, path = '', allKeys = []) {
  for (const key in obj) {
    const currentPath = path ? `${path}.${key}` : key;
    
    // Check if this key exists at the same level
    const existingKey = allKeys.find(k => k.key === key && k.level === path);
    if (existingKey) {
      console.log(`Duplicate key "${key}" found at path: ${currentPath} (also at ${existingKey.path})`);
    } else {
      allKeys.push({ key, path: currentPath, level: path });
    }
    
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      findDuplicateKeys(obj[key], currentPath, allKeys);
    }
  }
}

// Check Spanish file
console.log('=== Checking es.json ===');
const esContent = JSON.parse(fs.readFileSync('locales/es.json', 'utf8'));
findDuplicateKeys(esContent);

console.log('\n=== Checking en.json ===');
const enContent = JSON.parse(fs.readFileSync('locales/en.json', 'utf8'));
findDuplicateKeys(enContent);
