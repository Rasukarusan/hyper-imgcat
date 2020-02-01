// class ImageView extends React.Component {
//     render () {
//         return (
//             <div>hoge</div>
//         )
//     }
// }

exports.decorateTerm = (Term, { React, notify }) => {
    return class extends React.Component {
        constructor(props, context) {
          super(props, context);
          this.term = null;
          this.onDecorated = this.onDecorated.bind(this);
        }

        onDecorated(term) {
            console.log("はいいいいいいいいいいいいい");
            console.log(term);
            this.term = term;
            // Don't forget to propagate it to HOC chain
            if (this.props.onDecorated) this.props.onDecorated(term);
        }

        render () {
            // console.log("render");
            // console.log(this.props);
            // // const imgView = this.props.myState.message !== '' ?
            //     // React.createElement('img', {src: '/Users/rasukaru/Desktop/320x240.png'}) : null;
            //
            // // const imgView = React.createElement('div',null,'hoge');
            let imgView = null;
            let height = '80%';
            let message = 'message' in this.props.myState ? this.props.myState.message : ''; 
            if (message !== '') {
                console.log("きたね");
                imgView = React.createElement('div',null,'hoge');
                // height = '80%';
            }
            // var para = document.createElement("div");
            // para.style.cssText = "background-color: rgba(255,0,0,0.3);"
            // var t = document.createTextNode("hogheohge");
            // para.appendChild(t);
            // // document.getElementsByClassName("xterm-screen")[0].appendChild(para); 
            //
            const children = [
                React.createElement(Term, this.props),
                imgView,
            ];

            // const children = [React.createElement(
            //     Term,
            //     Object.assign({}, this.props, {
            //       onDecorated: this.onDecorated,
            //     }),
            //     imgView
            //   )];
            //
            return React.createElement('div', {style: { width: '100%', height: height, position: 'relative'}}, children)
            // return (
            //     <div>
            //         React.createElement(Term, Object.assign({}, this.props))
            //     </div>
            // )
            // return React.createElement('div', null, children)
        }
    }
}

exports.middleware = store => next => (action) => {
    if (action.type === 'SESSION_ADD_DATA') {
        if (action.data.match(/zsh: command not found: .*/g)) {
            store.dispatch({
                type: 'HOOK_COMMAND',
                message: 'what happen!?',
            });
        } else {
            store.dispatch({
                type: 'HOOK_COMMAND',
                message: '',
            });

        }
    }
    next(action);
}

exports.reduceUI = (state, action) => {
    switch (action.type) {
        case 'HOOK_COMMAND':
            const { message } = action;
            return state.set('myState', { message });
        default:
            return state;
    }
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
