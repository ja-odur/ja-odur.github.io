import "../../css/Home.css"
import "../../css/Projects.css"
import NavBar from "../common/NavBar";
import Content from "../common/Content";
import ProjectCard from "./ProjectCard";
import projects from "./data/Projects";


function ProjectsBody() {
    return (
        <div className="project-body">
            {
                projects && projects.map((project, projectID) => {
                    return (
                        <ProjectCard
                            key={projectID}
                            name={project.name}
                            image={project.image}
                            description={project.description}
                            link={project.link}
                            techStacks={project.techStacks}
                        />
                    )
                })
            }
        </div>
    )
}

function Projects() {
  return (
      <>
          <NavBar />
          <Content>
              <ProjectsBody />
          </Content>
      </>
  );
}

export default Projects;