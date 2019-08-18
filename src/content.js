/*global chrome*/
/* src/content.js */
import React from 'react';
import ReactDOM from 'react-dom';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import './content.css';

class Main extends React.Component {
  state = {
    scripts: {},
    numScripts: 1
  };

  addScript = () =>
    this.setState({
      numScripts: this.state.numScripts + 1
    });

  handleInputChange = (e, i) => {
    this.setState({
      scripts: { ...this.state.scripts, [i]: e.target.value }
    });
  };

  injectScripts = () => {
    const scripts = [];
    for (const key in this.state.scripts) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = this.state.scripts[key];
      document.head.appendChild(script);
      scripts.push(script.src);
    }
    alert(`Injected the following scripts: ${scripts.join(', \n')}`);
  };

  renderInputFields = () => {
    const nodes = [];
    for (let i = 0; i < this.state.numScripts; i++) {
      nodes.push(
        <input
          key={i}
          type="text"
          placeholder="Enter the script here"
          onChange={e => this.handleInputChange(e, i)}
        />
      );
    }
    return nodes;
  };

  render() {
    return (
      <Frame
        head={[
          <link
            type="text/css"
            rel="stylesheet"
            href={chrome.runtime.getURL('/static/css/content.css')}
          />
        ]}
      >
        <FrameContextConsumer>
          {// Callback is invoked with iframe's window and document instances
          ({ document, window }) => {
            // Render Children
            console.log(document, window);
            return (
              <div className={'my-extension'}>
                <div>
                  {this.renderInputFields()}
                  <button type="button" onClick={this.addScript}>
                    Add Script
                  </button>
                  <button type="button" onClick={this.injectScripts}>
                    Inject Scripts
                  </button>
                </div>
              </div>
            );
          }}
        </FrameContextConsumer>
      </Frame>
    );
  }
}

const app = document.createElement('div');
app.id = 'my-extension-root';

document.body.appendChild(app);
ReactDOM.render(<Main />, app);

app.style.display = 'none';

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.message === 'clicked_browser_action') {
    toggle();
  }
});

function toggle() {
  if (app.style.display === 'none') {
    app.style.display = 'block';
  } else {
    app.style.display = 'none';
  }
}
