function detectImgCatCommand(data) {
    const patterns = [
        'zsh: command not found: imgcat',
        'imgcat: command not found',
        'command not found: imgcat',
        'Unknown command \'imgcat\'',
        '\'imgcat\' is not recognized*',
    ];
  return new RegExp('(' + patterns.join(')|(') + ')').test(data)
}
module.exports = detectImgCatCommand;
