function Education({educationBackground}) {
    return (
        <>
            {
                educationBackground &&
                <>
                    <div className="resume-body-title"><span className="resume-body-pager"></span>Education</div>
                    {
                        educationBackground.map((eBackground, eID) => {
                            return (
                                <div className="education-wrapper" key={eID}>
                                    <div className="education-level">{eBackground.course}</div>
                                    <div className="education-institution">{eBackground.institution}</div>
                                    <div className="education-year">{eBackground.duration}</div>
                                </div>
                            )
                        })
                    }
                </>
            }
        </>
    );
}

export default Education;