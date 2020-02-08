hyper-imgcat
====

Display a image in a terminal.
This is inspired by iTerm2 imgcat.

## Description

Can be displayed on tmux.

## Demo

![demo2](https://user-images.githubusercontent.com/17779386/74082540-618adc80-4a9e-11ea-85ba-5dfaa3c8f954.gif)

## Requirement

- Hyper 3.02

## Install

If you installed iTerm2 imgcat, please remove that before install hyper-imgcat.  
Because this plugin hooks the words `command not found: imgcat`.

### ・npm

Not ready. Please wait.

### ・Manually

1. Download hyper-imgcat.
```shell
$ cd ~/.hyper_plugins/local
$ git clone https://github.com/Rasukarusan/hyper-imgcat.git
```

2. Add hyper-imgcat to localPlugins in `~/.hyper.js`.
```js
localPlugins: [
  'hyper-imgcat',
],
```

## Usage

```shell
$ imgcat ~/Desktop/lion.jpg
```

- The image path must be specified as an absolute path.
- Press `BACKSPACE`, the image will be hidden.

