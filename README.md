hyper-imgcat
====

Display a image in a terminal.
This is inspired by iTerm2 imgcat.

## Description

Can be displayed on tmux.

## Demo

![demo](https://user-images.githubusercontent.com/17779386/74082722-2ab5c600-4aa0-11ea-9eda-af10eca31e14.gif)

## Requirement

- Hyper 3.02

## Install

If you installed iTerm2 imgcat, please remove that before install hyper-imgcat.  
Because this plugin hooks the words `command not found: imgcat`.

Download hyper-imgcat.
```shell
$ cd ~/.hyper_plugins/local
$ git clone https://github.com/Rasukarusan/hyper-imgcat.git
```

Add hyper-imgcat to localPlugins in `~/.hyper.js`.
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

