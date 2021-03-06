const { execSync } = require('child_process');
const detectImgCatCommand = require('./detectCommand.js');

exports.decorateTerm = (Term, { React, notify }) => {
    return class extends React.Component {
        constructor(props, context) {
          super(props, context);
          this._originCursorColor = props.cursorColor;
          this._term = null;
          this._cursorFrame = null;
          this.onDecorated = this.onDecorated.bind(this);
          this.onCursorMove = this.onCursorMove.bind(this);
        }

        onDecorated(term) {
            if (term === null) return;
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

        removeImageView() {
            let imgView = document.getElementById('imgcat-view');
            if(!imgView) return;
            store.dispatch({
                type: 'HOOK_COMMAND',
                isCalledCommand: false,
                filePath: '',
                cursorColor: this._originCursorColor,
            });
        }

        handleKeyUp(event) {
            const {keyCode} = event;
            if (keyCode === 8) {
                this.removeImageView();
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
            if (!this.props.myState.isCalledCommand || this._cursorFrame === null) return null;

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
                        top: y + origin.top/2,
                        left: 0,
                        height: 'auto',
                        maxWidth:'100%',
                    },
                    src: this.props.myState.filePath,
                    id: 'imgcat-view'
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
                        cursorColor: this.props.myState.cursorColor,
                    })),
                this.createImageView(),
            ];

            return React.createElement(
                'div',
                {
                    style: { 
                        width: '100%', 
                        height: '100%', 
                    },
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
    let lastExecCommand = execSync('tail ' + getHistoryPath() + ' | grep imgcat | tail -n 1').toString();
    let home = execSync('echo $HOME | tr -d "\n"').toString() + '/';
    let commands = lastExecCommand.split('imgcat');
    let absolutePath = commands.pop().replace('~/', home);
    return absolutePath;
}

/**
 * Get history path of login shell.
 *
 * @return string
 */
function getHistoryPath() {
    let shell = execSync('echo $SHELL').toString();
    if (new RegExp('zsh').test(shell)) {
        return '~/.zsh_history';
    } else if (new RegExp('bash').test(shell)) {
        return '~/.bash_history';
    } else if (new RegExp('fish').test(shell)) {
        return '~/.local/share/fish/fish_history';
    }
}

exports.middleware = store => next => (action) => {
    if (action.type === 'SESSION_ADD_DATA') {
        const { data } = action;
        if (detectImgCatCommand(data)) {
            store.dispatch({
                type: 'HOOK_COMMAND',
                isCalledCommand: true,
                filePath: getFilePath(),
                cursorColor: 'rgba(0,0,0,0.0)',
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
            return state.set('myState', {
                isCalledCommand : action.isCalledCommand,
                filePath: action.filePath,
                cursorColor: action.cursorColor,
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
