function JobHeader({companyOrTitle, companyLocation, duration}) {
    return (
        <div className="resume-work-experience-title">
            <span className="job-title">{companyOrTitle}</span>
            <span className="job-date">{duration}</span>
            <span className="job-company">{companyLocation}</span>
        </div>
    )
}
function TechStacks({stacks}) {
    return (
                stacks && <div className="resume-work-experience-stack">
                    <span className="stack-label">Tech Stack:</span>
                    <div className="tech-stacks-container">
                        {
                            stacks.map((techStack, id) => {
                                return (
                                    <span className="tech-stack" key={id}>{techStack}</span>
                                )
                            })
                        }
                    </div>
                </div>

    )
}

function Roles({roles, nestedRoles, otherRoles}) {
    return (
        <>
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
        </>
    )
}


function MultipleTitleRoles({titleRoles}) {
    return (
        <>
            <ul className="round">
                    {
                        titleRoles && titleRoles.map((role, id) => {
                            return (
                                <li style={{margin: "20px 0"}} key={id}>
                                    <div className="multi-title-wrapper">
                                        <span className="multi-job-title">{role.title}</span>
                                        <span className="multi-job-date">{role.duration}</span>
                                    </div>
                                    <div className="multi-job-company">{role.location}</div>
                                    {role.description && <div className="multi-job-description">{role.description}</div>}
                                    {
                                        role.roles &&
                                        <ul>
                                            {role.roles.map((eachRole, id) => (
                                                <li key={id}>{eachRole}</li>
                                                )
                                            )}
                                        </ul>
                                    }
                                </li>
                            )
                        })
                    }
            </ul>
        </>
    )
}

export function MultipleTitleWorkExperience({
    company,
    companyDescription,
    companyLocation,
    duration,
    titleRoles,
    techStacks,
}) {
    return (
        <div className="resume-work-experience">
            <JobHeader companyOrTitle={company} companyLocation={companyLocation} duration={duration} />
            <div className="resume-work-experience-body">
                {companyDescription}
                <MultipleTitleRoles titleRoles={titleRoles} />
            </div>
            <TechStacks stacks={techStacks} />
        </div>
    );
}

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
            <JobHeader companyOrTitle={jobTitle} companyLocation={company} duration={duration} />
            <div className="resume-work-experience-body">
                {companyDescription}
                <Roles roles={roles} nestedRoles={nestedRoles} otherRoles={otherRoles} />
            </div>
            <TechStacks stacks={techStacks} />
        </div>
    );
}

export default WorkExperience;