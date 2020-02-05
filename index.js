const execSync = require('child_process').execSync;
const detectImgCatCommand = require('./detectCommand.js');

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

        removeImageView() {
            let imgView = document.getElementById('tanakaImage');
            if(!imgView) return;
            store.dispatch({
                type: 'HOOK_COMMAND',
                message: '',
                filePath: '',
            });
        }

        handleKeyUp(event) {
            const {keyCode} = event;
            switch (keyCode) {
                case 8: // BACKSPACE
                    this.removeImageView();
                    break;
                case 81: // q
                    this.removeImageView();
                    break;
                case 13: // ENTER

                    break;
                case 67: // Ctrl+C
                    break;
                case 37: // 矢印左
                    this.newLine(100);
                    break;
                case 39: // 矢印右
                    execSync('clear');
                    break;
                case 40: // 矢印下
                    break;
                default:
                    break;
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
    if (action.type === 'SESSION_ADD_DATA') {
        const { data } = action;
        if (detectImgCatCommand(data)) {
            store.dispatch({
                type: 'HOOK_COMMAND',
                message: 'what happen!?',
                filePath: getFilePath(),
            });
        } else {
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

