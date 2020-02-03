const execSync = require('child_process').execSync;

exports.decorateTerm = (Term, { React, notify }) => {
    return class extends React.Component {
        constructor(props, context) {
          super(props, context);
          this._term = null;
          this._cursorFrame = null;
          this._executedRow = 0;
          this._executedCommand = '';
          this.onDecorated = this.onDecorated.bind(this);
          this.onCursorMove = this.onCursorMove.bind(this);
        }

        onDecorated(term) {
            console.log(this.props);
            if (this.props.onDecorated) this.props.onDecorated(term);
            this._term = term;
            this._term.termRef.addEventListener(
                'keyup', event => this.handleKeyUp(event),
                false
           );
        }

        onCursorMove (cursorFrame) {
            if (this.props.onCursorMove) this.props.onCursorMove(cursorFrame);
            this._cursorFrame = cursorFrame;
        }

        componentDidUpdate(prevProps) {
        }

        /**
         * Get string of the target line
         *
         * @param Terminal core Term.term._core
         * @param int row
         */
        getLineString(core, row) {
            let buffer = core.buffers.normal;
            return buffer.translateBufferLineToString(row, false, 0, core.cols);
        }

        getCurrentLine() {
            return this.getLineString(this._term.term._core, this._cursorFrame.row)
        }

        handleKeyUp(event) {
            const {keyCode} = event;
            if(keyCode === 13) { // ENTER
                console.log("ENTER");
                console.log(this._term);
                this._executedRow = this._cursorFrame.row;
                this._executedCommand = this.getLineString(this._term.term._core, this._executedRow);
                return;
            } else if (keyCode === 8) { // BACKSPACE
                store.dispatch({
                    type: 'HOOK_COMMAND',
                    message: '',
                    filePath: '',
                });
            } else if (keyCode === 67) { // Ctrl+C
            } else if (keyCode === 37) { // 矢印左
                console.log("現在行:",this._cursorFrame.row);
                console.log("現在行文字列:", this.getLineString(this._term.term._core, this._cursorFrame.row));
                let buffer = this._term.term._core.buffers.normal;
                let line = buffer.lines.get(this._cursorFrame.row);
                let charData = [0, '', 1, 0];
                this._term.term._core.textarea.value = "hoge"
                // line.replaceCells(0, 100, charData);
                // let blankLine = buffer.getBlankLine(0, true);
                // this._term.term._core.buffers.normal.lines._array[this._cursorFrame.row] = blankLine;
                console.log(this._term.term._core.buffers.normal.lines);
                console.log(line);
                console.log(line.get(1));
            } else if (keyCode === 39) { // 矢印右
                console.log("右");
                let core = this._term.term._core

                // store.dispatch({
                //     type: 'SESSION_ADD_DATA',
                //     data: '',
                // });
                // store.dispatch({
                //     type: 'SESSION_PTY_DATA',
                //     uid: this._term.props.uid,
                //     data: 'hoge',
                // });
            // this._term.term._core.write(this.getLineString(this._term.term._core, this._cursorFrame.row));
            } else if (keyCode === 40) { // 矢印下
            } else if (keyCode === 81) { // q
                let imgView = document.getElementById('tanakaImage');
                if(!imgView) return;
                store.dispatch({
                    type: 'HOOK_COMMAND',
                    message: '',
                    filePath: '',
                });
            }
        }

        /**
         * Add new line to current line
         *
         * You can insert a line feed code instead of a space.
         * However, because the code differs depending on the platform, space filling is more versatile.
         *
         * @param int num The number of new line
         */
        newLine(num) {
            let newLine = ' '.repeat(this._term.term.cols * num);
            this._term.term._core.write(newLine);
        }

        createImageView() {
            if (this.props.myState.message === '' || this._cursorFrame === null) return null;
            // Insert a line break to keep the execution command on the display.
            // Hyper is designed so that if you insert a space-filling or line feed code that exceeds the width,
            // even if you hook with dispatch, the entered characters will remain.
            this.newLine(1);

            const { x, y } = this._cursorFrame;
            const origin = this._term.termRef.getBoundingClientRect();
            return React.createElement(
                'img',
                { 
                    style: {
                        position: 'absolute',
                        top: y + 2,
                        left: 0,
                        height: 'auto',
                        maxWidth:'100%',
                    },
                    src: this.props.myState.filePath,
                    id: 'tanakaImage'
                },
            );
        }

        render () {
            console.log("render");
            if (this.props.myState === undefined) {
                return React.createElement( Term, Object.assign({}, this.props, {
                        onDecorated: this.onDecorated,
                        onCursorMove: this.onCursorMove,
                }));
            }

            const children = [
                React.createElement(
                    Term,
                    Object.assign({}, this.props, {
                        onDecorated: this.onDecorated,
                        onCursorMove: this.onCursorMove,
                    })),
                this.createImageView(),
            ];

            return React.createElement(
                'div',
                {style: { 
                    width: '100%', 
                    height: '100%', 
                    position: 'relative'}
                },
                children
            )
        }
    }
}

/**
 * Get absolute path of the target image.
 *
 * Since "realpath" and "readlink" cannot be used in the Shell of Electron,
 * "~/" is replaced with $HOME.
 *
 * @return string e.g.) /Users/you/foo.png
 */
function getFilePath() {
    let lastExecCommand = execSync('tail -n 1 ~/.zsh_history').toString();
    let home = execSync('echo $HOME | tr -d "\n"').toString() + '/';
    let commands = lastExecCommand.split('imgcat');
    let absolutePath = commands.pop().replace('~/', home);
    return absolutePath;
}

exports.middleware = store => next => (action) => {
    // console.log(action);
    if (action.type === 'SESSION_ADD_DATA') {
        const { data } = action;
        if (detectImgCatCommand(data)) {
            store.dispatch({
                type: 'HOOK_COMMAND',
                message: 'what happen!?',
                filePath: getFilePath(),
            });
        } else {
            // store.dispatch({
            //     type: 'HOOK_COMMAND',
            // });
            next(action);
        }
    }else {
        next(action);
    }
}

exports.reduceUI = (state, action) => {
    switch (action.type) {
        case 'HOOK_COMMAND':
            if (state.myState === undefined) {
                return state.set('myState', {
                    message: '',
                    filePath: '',
                });
            }
            return state.set('myState', {
                message : action.message,
                filePath: action.filePath,
            });
    }
    return state;
};

exports.mapTermsState = (state, map) => Object.assign(map, {
    myState: state.ui.myState,
});

const passProps = (uid, parentProps, props) => Object.assign(props, {
    myState: parentProps.myState,
})

exports.getTermGroupProps = passProps;
exports.getTermProps = passProps;

exports.decorateConfig = (config) => {
    return Object.assign({}, config, {
        // cursorColor: 'blue',
        cursorColor: 'yellow',
    })
}

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
