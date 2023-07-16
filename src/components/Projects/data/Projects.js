import expandStringImg from "./expand-string.png"
import websiteImg from "./website.png"
import introspectorImg from "./introspector.png"
import boilerplateImg from "./boilerplate.png"


const projects = [
    {
        name: "Andrea",
        image: null,
        description: "Andrea is an online code compilation platform built with Python/Django and ReactJS. Currently, supported languages are; C++, Golang, NodsJS and Python",
        techStacks: "python, react, docker, bash",
        link: "https://github.com/ja-odur/andrea-pub",
    },
    {
        name: "Puzzled",
        image: null,
        description: "Puzzled is a web based gaming app. The app currently can crack any 2x2 or 3x3 Sudoku puzzles. Coming soon - poker.",
        techStacks: "python, react/typescript, graphene, docker, postgres, redis",
        link: "https://github.com/ja-odur/puzzled",
    },
    {
        name: "Django-React boilerplate",
        image: boilerplateImg,
        description: "Boilerplate code for a Django backend application that serves a React frontend, facilitating rapid development and deployment.",
        techStacks: "python, react, direnv",
        link: "https://github.com/ja-odur/django-react-boilerplate",
    },
    {
        name: '"J. A. Odur" Website',
        image: websiteImg,
        description: '"J. A. Odur" Website is a personal website showcasing projects, resume, and an "about me" section.',
        techStacks: "react, gh-pages",
        link: "https://ja-odur.github.io/",
    },
    {
        name: "Introspector",
        image: introspectorImg,
        description: "A self-installable Python package for retrieving information about other Python packages, including documentation, attributes, methods, and method signatures.",
        techStacks: "python",
        link: "https://github.com/ja-odur/introspector",
    },
    {
        name: "expand-string",
        image: expandStringImg,
        description: "A PyPI package for expanding numeric-value parentheses in strings to their corresponding string values.",
        techStacks: "python, pypi-package",
        link: "https://pypi.org/project/expand-string/",
    },
];

export default projects;
