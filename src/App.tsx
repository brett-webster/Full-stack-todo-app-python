import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "./assets/vite.svg";
import "./App.css";
import axios from "axios";

function App() {
  const [count, setCount] = useState(0);

  // -------------------

  // BELOW ADDED FOR API ENDPOINT REQUESTS
  const [getRequestOnLoad, setGetRequestOnLoad] = useState<string>("");
  const [inputNumber, setInputNumber] = useState<number>(0);
  const [apiResponseNumber, setApiResponseNumber] = useState<number>(0);

  interface ApiResponse {
    onceTwice: {
      once: string;
    };
  }

  interface PostResponse {
    apiResponseNumber: number;
  }

  // SAMPLE ENDPOINT REQUESTS
  // on inital page load only --> GET request
  const initialLoadOnly = async () => {
    const getResponse: ApiResponse = (await axios.get<ApiResponse>("/api"))
      ?.data;
    setGetRequestOnLoad(getResponse.onceTwice.once);
  };
  void initialLoadOnly(); // @typescript-eslint/no-floating-promises <-- ADDED 'void' to eliminate linting error: Promises must be awaited, end with a call to .catch, end with a call to .then with a rejection handler or be explicitly marked as ignored with the `void` operator

  // on field input + button click --> POST request
  const callEndpointOnClick = async () => {
    const postResponse: PostResponse = (
      await axios.post<PostResponse>("/api", { inputNumber })
    )?.data;
    setApiResponseNumber(postResponse.apiResponseNumber);
  };

  const handleFieldValueChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setInputNumber(Number(event.target.value));
  };

  // -------------------

  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>

      {/* BELOW ADDED FOR API ENDPOINT REQUESTS */}
      <br></br>
      <br></br>
      <span>SIMPLE GET REQUEST WORKING FROM BACKEND: {getRequestOnLoad}</span>
      <br></br>
      <br></br>
      <input value={inputNumber} onChange={handleFieldValueChange}></input>
      <button onClick={() => void callEndpointOnClick()}>Click me</button>
      <br></br>
      <span>NUMBER INPUT: {inputNumber}</span>
      <br></br>
      <span>NUMBER OUTPUT: {apiResponseNumber}</span>
    </>
  );
}

export default App;
