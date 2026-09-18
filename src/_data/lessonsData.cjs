const fs = require('fs');
const path = require('path');

module.exports = function () {
    const filePath = path.join(__dirname, '..', '..', 'lessons.json');
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
};
