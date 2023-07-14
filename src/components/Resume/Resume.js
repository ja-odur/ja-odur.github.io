import "../../css/Home.css"
import "../../css/Resume.css"
import NavBar from "../common/NavBar";
import Content from "../common/Content";
import WorkExperience from "./WorkExperience";
import workExperienceData from "./data/WorkExperience";
import ResumeSideBar from "./ResumeSideBar";
import PdfDownloader from "../common/PdfDownloader";

function ResumeHeader() {
    return (
        <div className="resume-header">
            <PdfDownloader rootElementId={"resume"} downloadFileName={"resume-joseph-odur"} />
            <div className="resume-title">
                <span className="title-content name">Joseph Odur</span>
                <span className="title-content occupation">Software Engineer</span>
            </div>
            <span className="resume-contact">
                <span className="contact-item">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="phone-square" role="img"
                         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg=""
                         className="svg-inline--fa fa-phone-square fa-w-14 fa-fw fa-lg mr-2" width="20px">
                        <path fill="currentColor"
                              d="M400 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V80c0-26.51-21.49-48-48-48zM94 416c-7.033 0-13.057-4.873-14.616-11.627l-14.998-65a15 15 0 0 1 8.707-17.16l69.998-29.999a15 15 0 0 1 17.518 4.289l30.997 37.885c48.944-22.963 88.297-62.858 110.781-110.78l-37.886-30.997a15.001 15.001 0 0 1-4.289-17.518l30-69.998a15 15 0 0 1 17.16-8.707l65 14.998A14.997 14.997 0 0 1 384 126c0 160.292-129.945 290-290 290z">
                        </path>
                    </svg>
                        + 256 777617455
                </span>

                <span className="contact-item">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="envelope-square"
                         role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" data-fa-i2svg=""
                         className="svg-inline--fa fa-envelope-square fa-w-14 fa-fw fa-lg mr-2" width="20px">
                        <path fill="currentColor"
                              d="M400 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V80c0-26.51-21.49-48-48-48zM178.117 262.104C87.429 196.287 88.353 196.121 64 177.167V152c0-13.255 10.745-24 24-24h272c13.255 0 24 10.745 24 24v25.167c-24.371 18.969-23.434 19.124-114.117 84.938-10.5 7.655-31.392 26.12-45.883 25.894-14.503.218-35.367-18.227-45.883-25.895zM384 217.775V360c0 13.255-10.745 24-24 24H88c-13.255 0-24-10.745-24-24V217.775c13.958 10.794 33.329 25.236 95.303 70.214 14.162 10.341 37.975 32.145 64.694 32.01 26.887.134 51.037-22.041 64.72-32.025 61.958-44.965 81.325-59.406 95.283-70.199z">
                        </path>
                    </svg>
                    <span className="clickable">odurjoseph8@gmail.com</span>
                </span>

                <span className="contact-item">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="globe" role="img"
                         xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" data-fa-i2svg=""
                         className="svg-inline--fa fa-globe fa-w-16 fa-fw fa-lg mr-2" width="20px">
                        <path fill="currentColor"
                              d="M336.5 160C322 70.7 287.8 8 248 8s-74 62.7-88.5 152h177zM152 256c0 22.2 1.2 43.5 3.3 64h185.3c2.1-20.5 3.3-41.8 3.3-64s-1.2-43.5-3.3-64H155.3c-2.1 20.5-3.3 41.8-3.3 64zm324.7-96c-28.6-67.9-86.5-120.4-158-141.6 24.4 33.8 41.2 84.7 50 141.6h108zM177.2 18.4C105.8 39.6 47.8 92.1 19.3 160h108c8.7-56.9 25.5-107.8 49.9-141.6zM487.4 192H372.7c2.1 21 3.3 42.5 3.3 64s-1.2 43-3.3 64h114.6c5.5-20.5 8.6-41.8 8.6-64s-3.1-43.5-8.5-64zM120 256c0-21.5 1.2-43 3.3-64H8.6C3.2 212.5 0 233.8 0 256s3.2 43.5 8.6 64h114.6c-2-21-3.2-42.5-3.2-64zm39.5 96c14.5 89.3 48.7 152 88.5 152s74-62.7 88.5-152h-177zm159.3 141.6c71.4-21.2 129.4-73.7 158-141.6h-108c-8.8 56.9-25.6 107.8-50 141.6zM19.3 352c28.6 67.9 86.5 120.4 158 141.6-24.4-33.8-41.2-84.7-50-141.6h-108z">
                        </path>
                    </svg>
                    <span className="clickable">https://github.com/ja-odur</span>
                </span>

                <span className="contact-item">
                    <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="map-marker-alt"
                         role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" data-fa-i2svg=""
                         className="svg-inline--fa fa-map-marker-alt fa-w-12 fa-fw fa-lg mr-2" width="20px">
                        <path fill="currentColor"
                              d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z">
                        </path>
                    </svg>
                    Kampala, Uganda
                </span>
            </span>
        </div>
    );
}

function ResumeManifest() {
    return (
        <div className="resume-manifest">
            I'm a dynamic, dependable, detail-oriented, and highly analytical Software Engineer with 3+ years in the
            industry. I specialise in building modern software applications using the latest technologies and
            engineering methods.
            I am well-versed with Requirement analysis, Object-Oriented design, design patterns, versioning, agile and
            test-driven development.
        </div>
    );
}

function ResumeContent() {
   return (

       <div className="resume-body-main">
           <div className="resume-body-title"><span className="resume-body-pager"></span>work experience</div>
           {
               workExperienceData.map((workExperience, id) => {
                   return (
                       <WorkExperience
                           company={workExperience.company}
                           companyDescription={workExperience.companyDescription}
                           jobTitle={workExperience.jobTitle}
                           duration={workExperience.duration}
                           roles={workExperience.roles}
                           otherRoles={workExperience.otherRoles}
                           nestedRoles={workExperience.nestedRoles}
                           techStacks={workExperience.techStacks}
                           key={id}
                       />
                   )
               })
           }
       </div>
   );
}



function ResumeBody() {
    return (
        <div className="resume-body">
            <ResumeContent />
            <ResumeSideBar />
        </div>
    );
}

function Resume() {
  return (
    <>
        <NavBar />
        <Content>
            <div className="resume-container" id="resume">
                <ResumeHeader />
                <ResumeManifest />
                <ResumeBody />
            </div>
        </Content>
    </>
  );
}

export default Resume;