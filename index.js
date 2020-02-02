const execSync = require('child_process').execSync;

exports.decorateTerm = (Term, { React, notify }) => {
    return class extends React.Component {
        constructor(props, context) {
          super(props, context);
          this._term = null;
          this._cursorFrame = null
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

        handleKeyUp(event) {
            const {keyCode} = event;
            // console.log(keyCode);
            if(keyCode === 13) { // ENTER
                // console.log(this._term.term.textarea);
                return;
            } else if (keyCode === 8) { // BACKSPACE
                store.dispatch({
                    type: 'HOOK_COMMAND',
                    message: '',
                });
            } else if (keyCode === 67) { // Ctrl+C
            } else if (keyCode === 40) { // 矢印下
                // console.log(this._term.term.getSelection());
            } else if (keyCode === 81) { // q
            }
        }

        onCursorMove (cursorFrame) {
          if (this.props.onCursorMove) this.props.onCursorMove(cursorFrame);
          this._cursorFrame = cursorFrame;
        }

        createImageView() {
            if (this.props.myState.message === '' || this._cursorFrame === null) return null;
            const { x, y } = this._cursorFrame;
            const origin = this._term.termRef.getBoundingClientRect();
            let imgView = React.createElement(
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

            let hoge = document.getElementById('tanakaImage');
            console.log(hoge);
            return imgView;
        }

        render () {
            console.log("render");
            // console.log(this._term);
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

function getFilePath(data) {
    // 下記の理由からHISTORYファイルを直接参照してimgcatの引数を取得する
    //   - Hyperはcanvasで1文字ずつrenderするため、実行したコマンド(入力エリアの値)を取得することができない
    //   - historyコマンドはbuiltin-commandなのでelectronアプリでは使用できない
    //   - 上記同様の理由で$HISFILEが参照できない
    //   - 最後に実行したコマンドを示す「!!」も使用不可
    let lastExecCommand = execSync('cat ~/.zsh_history | tail -n 1').toString();
    let home = execSync('echo $HOME | tr -d "\n"').toString();
    let filePath = lastExecCommand.split(' ').pop().replace('~/', home+'/');
    return filePath;
}

exports.middleware = store => next => (action) => {
    // console.log(action);
    if (action.type === 'SESSION_ADD_DATA') {
        const { data } = action;
        if (detectImgCatCommand(data)) {
            store.dispatch({
                type: 'HOOK_COMMAND',
                message: 'what happen!?',
                filePath: getFilePath(data),
            });
        } else {
            // store.dispatch({
            //     type: 'HOOK_COMMAND',
            //     message: '',
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
        'zsh: command not found',
        'imgcat: command not found',
        'command not found: imgcat',
        'Unknown command \'imgcat\'',
        '\'imgcat\' is not recognized*',
    ];
  return new RegExp('(' + patterns.join(')|(') + ')').test(data)
}
