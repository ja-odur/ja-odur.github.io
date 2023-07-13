import "../Home.css"
import NavBar from "./common/NavBar";
import Content from "./common/Content";

function Home() {
  return (
    <>
        <NavBar />
        <Content>
            <div className="text-container">
                <span className="text-greeting">Hello,</span>
                <span className="text-intro">I'm <span className="text-intro-name">Joseph Odur</span>.</span>
                <span className="text-occupation">A Software Engineer,</span>
                <span className="text-more">and human being from Earth!</span>
            </div>
        </Content>
    </>
  );
}

export default Home;