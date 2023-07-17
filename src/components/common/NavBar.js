import logoGray from '../../logo-gray.svg';
import { Link, NavLink } from "react-router-dom";


function NavBar() {
  return (
      <nav className="nav">
        <div className="nav-container">
          <div className="nav-intro">
            <Link to="/">
              <img className="logo-gray" src={logoGray}  alt="logo" />
            </Link>

            <NavLink to="/">
              {
                ({ isActive, isPending }) => (
                  <span className={isActive ? "nav-name nav-info-active" : "nav-name"}>j. a. odur</span>
                )
              }
            </NavLink>
          </div>
          <div className="nav-info">
            <NavLink to="/projects" >
              {
                ({ isActive, isPending }) => (
                  <span className={isActive ? "nav-info-active" : ""}>projects</span>
                )
              }
            </NavLink>
            <NavLink to="/resume" >
              {
                ({ isActive, isPending }) => (
                  <span className={isActive ? "nav-info-active" : ""}>resume</span>
                )
              }
            </NavLink>
            <a href="https://github.com/ja-odur" target="_blank" rel="noreferrer">
              github
            </a>
          </div>
        </div>
      </nav>
  );
}

export default NavBar;