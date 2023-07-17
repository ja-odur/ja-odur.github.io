function makeText() {
    const lorem = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum veritatis eaque necessitatibus, explicabo vero hic, perspiciatis unde minus error consectetur, quos sunt officiis ad repellendus pariatur eligendi tempora praesentium tenetur';
    const loremArray = lorem.split(' ');
    const amountOfText = Math.floor(Math.random() * (30 - 10) + 10);
    const text = loremArray.slice(0, amountOfText);

    return text.join(' ') + '.';
}

function randomRotate() {
    const deg = Math.random() * (5 - -5) + -5;
    return 'rotate(' + deg + 'deg)';
}

function ProjectCard({name, description, techStacks, link, image}) {
    return (
        <a className="project-card-link" href={link} target="_blank" rel="noreferrer">
            <div className="project-card" style={{transform: randomRotate()}}>
                <img src={image || `https://picsum.photos/id/${1 + 19 * 1}/600/300`} alt={name} />
                <h2>{name}</h2>
                <p>{description}</p>
                <h2>Tech Stacks</h2>
                <p>{techStacks}</p>
            </div>
        </a>
    )
}

export default ProjectCard;
