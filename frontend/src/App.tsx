import React from 'react';
import logo from './assets/images/logo.svg';
import BorrowCarPage from "./pages/BorrowCar";
import './App.css';

function App() {
  return (
    // <div className="App">

    // </div>
    <div>
      {/* <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header> */}
      <BorrowCarPage/>
    </div>
  );
}

export default App;
