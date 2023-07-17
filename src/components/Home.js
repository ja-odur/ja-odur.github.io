import "../css/Home.css"
import { useState } from "react";
import NavBar from "./common/NavBar";
import Content from "./common/Content";
import { TypeAnimation } from "react-type-animation";

function TypedGreeting({doneTypingCallback}) {
    return(
        <TypeAnimation
            cursor={false}
            sequence={[
                1000,
                "Hello",
                500,
                "Hello 👋",
                500,
                "Hello 👋.,,",
                800,
                "Hello 👋,",
                () => doneTypingCallback && doneTypingCallback()
            ]}
            deletionSpeed={1}
        />
    )
}

function TypedIntro() {

    return(
        <>
            <TypeAnimation
                cursor={false}
                sequence={[
                    "I'm ",
                ]}
            />
            <span className="text-intro-name">
                <TypeAnimation
                    cursor={true}
                    sequence={[
                        500,
                        "Joseph Odur.",
                        7000,
                        "J. A. Odur.",
                        4000,
                        "Ja-",
                        500,
                        "ja-odur.",
                        3000
                    ]}
                    repeat={Infinity}
                />
            </span>
        </>
    )
}

function TypedOccupation() {
    return (
        <TypeAnimation
            cursor={false}
            sequence={[
                5000,
                "A Software Engineer,",
            ]}
        />
    )
}

function TypedMore() {
    return (
        <TypeAnimation
            cursor={false}
            sequence={[
                7000,
                "and human being from Earth!",
            ]}
        />
    )
}



function Home() {
    const [showMainBody, setShowMainBody] = useState(false);

    const showMainBodyCallback = () => setShowMainBody(true);

    return (
        <>
            <NavBar />
            <Content>
                <div className="text-container">
                    <span className="text-greeting"><TypedGreeting doneTypingCallback={showMainBodyCallback} /></span>
                    {
                       showMainBody &&
                        <>
                            <span className="text-intro"><TypedIntro /></span>
                            <span className="text-occupation"><TypedOccupation /></span>
                            <span className="text-more"><TypedMore /></span>
                        </>
                    }
                </div>
            </Content>
        </>
    );
}

export default Home;