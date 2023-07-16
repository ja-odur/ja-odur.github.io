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

export default SkillsBar;
