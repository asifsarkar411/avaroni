const fs = require('fs');
const code = fs.readFileSync('public/admin.js', 'utf8');
let parens = 0, curly = 0, square = 0;
for (let i = 0; i < code.length; i++) {
    if (code[i] === '(') parens++;
    if (code[i] === ')') parens--;
    if (code[i] === '{') curly++;
    if (code[i] === '}') curly--;
    if (code[i] === '[') square++;
    if (code[i] === ']') square--;
}
console.log('Parens:', parens, 'Curly:', curly, 'Square:', square);
