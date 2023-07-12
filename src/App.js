import {Routes, Route, HashRouter, BrowserRouter,} from "react-router-dom"
import Home from "./components/Home";
import Resume from "./components/Resume";

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" exact element={<Home />} />
          <Route path="/resume" exact element={<Resume />} />
        </Routes>
      </BrowserRouter>

  );
}

export default App;
