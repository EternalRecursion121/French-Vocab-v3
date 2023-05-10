const Database = require('@replit/database');
const db = new Database;

db.get("alternate_translations").then(console.log);