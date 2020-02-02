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
            this._term = term;
            if (this.props.onDecorated) this.props.onDecorated(term);
            if(this._term.termRef !== null) {
                this._term.termRef.addEventListener(
                    'keyup', event => this.handleKeyUp(event),
                    false
               );
            }
        }

        handleKeyUp(event) {
            const {keyCode} = event;
            if(keyCode === 13) { // ENTER
                return;
            } else if (keyCode === 8) { // BACKSPACE
                store.dispatch({
                    type: 'HOOK_COMMAND',
                    message: '',
                });
            } else if (keyCode === 67) { // Ctrl+C
            }
        }

        onCursorMove (cursorFrame) {
          if (this.props.onCursorMove) this.props.onCursorMove(cursorFrame);
          this._cursorFrame = cursorFrame;
        }

        custom(term) {
            if(term == null) return;
            let imgView = React.createElement('div',null,'hoge');

            this._container = term.termRef;
            this._xTermScreen = this._container.querySelector('.xterm .xterm-screen');
            const renderLayers = Array.from(this._xTermScreen.querySelectorAll('canvas'));

            var para = document.createElement("div");
            para.style.cssText = "background-color: rgba(255,0,0,0.3);"
            var t = document.createTextNode("hogheohge");
            para.appendChild(t);
            // renderLayers[1].append(para)
            // renderLayers[2].style.cssText = "background-color: rgba(255,0,0,0.3);"
            for (const canvas of renderLayers) {
                // console.log(canvas);
                canvas.style.opacity = 1.0;
            }
        }

        render () {
            console.log("render");
            if (this.props.myState === undefined) {
                return React.createElement( Term, Object.assign({}, this.props));
            }
            // console.log(this._term);
            // this.custom(this._term);
            let imgView = null;
            if (this.props.myState.message !== '' && this._cursorFrame !== null) {
                console.log("きたね");
                // console.log(this.props.myState);
                const { x, y } = this._cursorFrame;
                const origin = this._term.termRef.getBoundingClientRect();
                imgView = React.createElement(
                    'img', {
                    style: {
                        position: 'absolute',
                        top: y +2 ,//+ origin.top, //+ 15,
                        left: 0,
                    },
                    src: this.props.myState.filePath //'/Users/rasukaru/Desktop/320x240.png',
                    }
                );
            }

            const children = [
                React.createElement(
                    Term,
                    Object.assign({}, this.props, {
                        onDecorated: this.onDecorated,
                        onCursorMove: this.onCursorMove,
                    })),
                imgView,
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
