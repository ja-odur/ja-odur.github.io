import { Routes, Route, HashRouter } from "react-router-dom"
import Home from "./components/Home";
import Resume from "./components/Resume";
import Projects from "./components/Projects";

function App() {
  return (
      <HashRouter>
          <Routes>
              <Route path="/" exact element={<Home />} />
              <Route path="/resume" exact element={<Resume />} />
              <Route path="/projects" exact element={<Projects />} />
          </Routes>
      </HashRouter>

  );
}

export default App;
