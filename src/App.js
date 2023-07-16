import {Routes, Route, HashRouter, BrowserRouter,} from "react-router-dom"
import Home from "./components/Home";
import Resume from "./components/Resume";
import Projects from "./components/Projects";

function App() {
  return (
      <BrowserRouter>
        <Routes>
            <Route path="/" exact element={<Home />} />
            <Route path="/resume" exact element={<Resume />} />
            <Route path="/projects" exact element={<Projects />} />
        </Routes>
      </BrowserRouter>

  );
}

export default App;
