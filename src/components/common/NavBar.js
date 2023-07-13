import logoGray from '../../logo-gray.svg';
import { Outlet, Link, NavLink } from "react-router-dom";


function NavBar() {
  return (
      <nav className="nav">
        <div className="nav-container">
          <Link to="/">
            <div className="nav-intro">
              <img className="logo-gray" src={logoGray}  alt="logo" />
              {/*<svg className="circle" focusable="false" viewBox="0 0 24 24" aria-hidden="true">*/}
              {/*  <path*/}
              {/*      d="M2 12C2 6.48 6.48 2 12 2s10 4.48 10 10-4.48 10-10 10S2 17.52 2 12zm10 6c3.31 0 6-2.69 6-6s-2.69-6-6-6-6 2.69-6 6 2.69 6 6 6z"></path>*/}
              {/*</svg>*/}
              <div className="nav-name">j. a. odur</div>
            </div>
          </Link>
          <div className="nav-info">
            <NavLink to="/projects" >
              {
                ({ isActive, isPending }) => (
                  <span className={isActive ? "nav-info-active" : ""}>projects</span>
                )
              }
            </NavLink>
            <Link to="/resume" target="_blank">resume</Link>
            <a href="https://github.com/ja-odur" target="_blank">
              github
            </a>
          </div>
        </div>
      </nav>
  );
}

export default NavBar;