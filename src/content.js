/*global chrome*/
/* src/content.js */
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Frame, { FrameContextConsumer } from 'react-frame-component';
import './content.css';

const SCRIPT_KEY = 'injected-from-chrome-extension';

const Main = () => {
  const [scripts, setScripts] = useState({});
  const [numScripts, setNumScripts] = useState(1);

  useEffect(() => {
    if (window.localStorage) {
      const injectedScripts =
        JSON.parse(window.localStorage.getItem(SCRIPT_KEY)) || {};
      console.log(injectedScripts);
      setNumScripts(
        Object.keys(injectedScripts).length > 1
          ? Object.keys(injectedScripts).length
          : 1
      );
      setScripts(injectedScripts || {});
      injectScriptsIntoDOM();
      return saveToLocalStorage;
    }
  }, []);

  const addScript = () => setNumScripts(numScripts + 1);

  const handleInputChange = (e, i) => {
    setScripts({ ...scripts, [i]: e.target.value });
  };

  const injectScriptsIntoDOM = () => {
    const addedScripts = [];
    for (const key in scripts) {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = scripts[key];
      script.setAttribute(SCRIPT_KEY, true);
      document.head.appendChild(script);
      addedScripts.push(script.src);
    }
    saveToLocalStorage();
    // alert(`Injected the following scripts: ${addedScripts.join(', \n')}`);
  };

  const renderInputFields = () => {
    const nodes = [];
    for (let i = 0; i < numScripts; i++) {
      nodes.push(
        <input
          key={i}
          type="text"
          value={scripts[i] || ''}
          placeholder="Enter the CDN link here..."
          onChange={e => handleInputChange(e, i)}
        />
      );
    }
    return nodes;
  };

  const saveToLocalStorage = () =>
    localStorage.setItem(SCRIPT_KEY, JSON.stringify(scripts));

  return (
    <Frame
      head={[
        <link
          type="text/css"
          rel="stylesheet"
          href={'https://fonts.googleapis.com/css?family=Lato&display=swap'}
        />,
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
          console.log('Re-rendering');
          return (
            <div className="container">
              <div className="inputfield-container">{renderInputFields()}</div>

              <button type="button" onClick={addScript}>
                Add Another Script
              </button>
              <button type="button" onClick={injectScriptsIntoDOM}>
                Inject Scripts
              </button>
            </div>
          );
        }}
      </FrameContextConsumer>
    </Frame>
  );
};

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
