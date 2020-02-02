let data = 'zsh: command not found: lsl'
console.log(data.lastIndexOf('found:'));
console.log(data.lastIndexOf(':'));
console.log(data.split(':').pop().trim());
let arg = data.substring(data.indexOf('found:')+1, data.lastIndexOf(':'));
console.log(arg);
