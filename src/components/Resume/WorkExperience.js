function WorkExperience({
    company,
    companyDescription,
    jobTitle,
    duration,
    roles,
    otherRoles,
    nestedRoles,
    techStacks,
}) {
    return (
        <div className="resume-work-experience">
            <div className="resume-work-experience-title">
                <span className="job-title">{jobTitle}</span>
                <span className="job-date">{duration}</span>
                <span className="job-company">{company}</span>
            </div>
            <div className="resume-work-experience-body">
                {companyDescription}
                <ul>
                    {
                        roles && roles.map((role, id) => {
                            return (
                                <li key={id}>{role}</li>
                            )
                        })
                    }

                    {
                        nestedRoles && nestedRoles.map((nestedRole, id) => {
                            return (
                               <li key={id}>
                                   {nestedRole.description}
                                   <ol>
                                       {
                                            nestedRole.roles && nestedRole.roles.map((role, roleID) => {
                                               return (
                                                   <li key={roleID}>{role}</li>
                                               )
                                           })
                                       }
                                   </ol>
                                   <div className="resume-work-experience-stack">
                                       <span className="stack-label">Tech Stack:</span>
                                       <div className="tech-stacks-container">
                                           {
                                               nestedRole.techStacks && nestedRole.techStacks.map((nestedTechStack, stackID) => {
                                                   return (
                                                       <span key={stackID} className="tech-stack">{nestedTechStack}</span>
                                                   )
                                               })
                                           }
                                       </div>
                                   </div>
                               </li>
                            )
                        })
                    }

                </ul>
                {
                    otherRoles &&
                    <>
                        Other responsibilities included;
                        <ul>
                            {
                                otherRoles.map((role, id) => {
                                    return (
                                        <li key={id}>{role}</li>
                                    )
                                })
                            }
                        </ul>
                    </>
                }
            </div>
            {
                techStacks && <div className="resume-work-experience-stack">
                    <span className="stack-label">Tech Stack:</span>
                    <div className="tech-stacks-container">
                        {
                            techStacks.map((techStack, id) => {
                                return (
                                    <span className="tech-stack" key={id}>{techStack}</span>
                                )
                            })
                        }
                    </div>
                </div>
            }
        </div>
    );
}

export default WorkExperience;