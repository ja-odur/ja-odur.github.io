import skills from "./data/skills";

function SkillsBar({skills}) {
    return (
        <>
            <div className="resume-body-title"><span className="resume-body-pager"></span>skills</div>
            <ul>
                {
                    skills && skills.map((skill, skillID) => {
                        return (
                            <li key={skillID}>
                                {skill.category && <span className="skill-category" >{skill.category}</span>}
                                {
                                    skill.details && skill.details.map((detail, detailID) => {
                                        return (
                                            <div className="skill-container" key={detailID}>
                                                {detail.name}
                                                <div className="progress-wrapper">
                                                    <div className={`progress-bar progress-length-${detail.levelPercent}`}></div>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </li>
                        )
                    })
                }
            </ul>
        </>
    );
}
function Education() {
    return (
        <>
            <div className="resume-body-title"><span className="resume-body-pager"></span>Education</div>
            <div className="education-wrapper">
                <div className="education-level">BSC-TELECOMMUNICATIONS ENGINEERING</div>
                <div className="education-institution">MAKERERE UNIVERSITY</div>
                <div className="education-year">2014 - 2019</div>
            </div>
            <div className="education-wrapper">
                <div className="education-level">A-LEVEL</div>
                <div className="education-institution">St. Mary's College, Kisubi</div>
                <div className="education-year">2012 - 2013</div>
            </div>
        </>
    );
}

function Hobbies() {
    return (
        <>
            <div className="resume-body-title"><span className="resume-body-pager"></span>Hobbies</div>
            <div className="hobby">Learning new techs</div>
            <div className="hobby">Board games</div>
            <div className="hobby">Soccer</div>
        </>
    );
}

function ResumeSideBar() {
    return (
        <div className="resume-body-side">
            <SkillsBar skills={skills} />
            <Education />
            <Hobbies />
        </div>
    );
}

export default ResumeSideBar;
