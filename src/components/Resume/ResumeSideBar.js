import SkillsBar from "./SkillsBar";
import Education from "./Education";
import Hobbies from "./Hobbies";
import skills from "./data/skills";
import educationBackground from "./data/education";
import hobbies from "./data/hobbies";

function ResumeSideBar() {
    return (
        <div className="resume-body-side">
            <SkillsBar skills={skills} />
            <Education educationBackground={educationBackground} />
            <Hobbies hobbies={hobbies} />
        </div>
    );
}

export default ResumeSideBar;
