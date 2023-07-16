const workExperienceData = [
    {
        company: "AirQo, Kampala, Uganda",
        companyDescription: "AirQo is Africa's leading air quality monitoring, research and analytics network. AirQo uses low cost technologies and AI to close the gaps in air quality data across the continent with a goal to find data-driven solutions to air quality challenges.",
        jobTitle: "Software Engineer",
        duration: "08/2020 - present",
        roles: [
            <p>Taking full ownership of <b>NetManager</b> platform. Platform for monitoring devices and visualising air quality data using heatmaps and charts</p>,
            <p>Implemented platform <b>mobile responsiveness</b> to enable easy adoption of the platform by the hardware team</p>,
            <p>Work closely with the Data Science team to <b>integrate heat-map/calibrate models</b> onto the NetManager platform.</p>,
            <p>Training of <b>Airqocommunity champions</b>(selected locals) about air quality and how to use the available AirQo tools inorder to spread awareness.</p>,
            <p>Improving on the <b>existing micro-service architecture</b>.</p>,
            <p>Managing the implementation of <b>outsourced applications/tools</b> to external teams.</p>
        ],
        techStacks: [
            "Microservice-Architecture",
            "Python",
            "Node",
            "MongoDB",
            "GCP",
            "Redis",
            "D3.js",
            "MapBox.js"
        ]
    },
    {
        company: "GitPrime/Pluralsight Flow, Farmington, USA",
        companyDescription: "GitPrime/Pluralsight Flow aggregates data from git repositories such as Github, BitBucket etc; ticketing systems such as Jira etc; cloud platforms (Azure, AWS etc), and Pull Requests and transforms them into easy to understand insights and reports. With visibility into the software development process.  This helps engineering organizations map initiatives to outcomes, adjust processes with confidence, and advocate for their teams with facts instead of feelings. The key functionalities included;",
        jobTitle: "Software Engineer (Contractor)",
        duration: "08/2019 - 01/2020",
        roles: [
            <p>Performed <b>Database and Query Optimization</b> i.e identifying slow query statements and optimizing or splitting them up to speed up the report generation process.</p>,
            <p><b>Build Repository inspection interface</b>. This helps in verifying and replaying customer repository-related issues in order to understand the cause of the issue and implement possible fixes.</p>,
            <p>Implemented <b>Partition-Based</b> query to improve the performance of API endpoints for customers with enormous data.</p>,
            <p>Implemented <b>Deferred</b> and <b>Advanced</b> filtering in order to sort API data filtering/query parameters according to the complexity of the backend filtering logic.</p>,
            <p>Consumed REST API endpoints to feed data into the different parts of the application.</p>,
            <p>Involved in testing existing API endpoints</p>
        ],
        techStacks: [
            "Python/Django",
            "Postgres",
            "React/Flow",
            "React-Redux",
            "Bash",
            "Redis"
        ]
    },
    {
        company: "Andela, Kampala, Uganda",
        companyDescription: "Andela invests in Africa’s most talented software engineers to help companies solve the technical talent shortage and build high-performing distributed engineering teams.",
        jobTitle: "Software Engineer",
        duration: "06/2018 - 04/2020",
        nestedRoles: [
            {
                description: <p>Worked on an internal company product called <b>Activo</b>. This web app is helping the company to manage inventory and act as a single source of truth for information regarding the state of every company asset. Below are some of the functionalities I worked on;</p>,
                roles: [
                    <p>Implemented Role-Based Authentication to give users different level of privileges to the underlying resources.</p>,
                    <p>Testing and documenting existing APIS using swagger.</p>,
                    <p>Consumed REST API endpoints to feed data into the different parts of the application.</p>
                ],
                techStacks: [
                    "Python/Flask",
                    "Postgres",
                    "Redis",
                    "SQL-Alchemy",
                    "React",
                    "React-Redux",
                    "Docker"
                ]
            },
            {
                description: <p>Worked on <b>AndelaEats</b>, a web application that helps the company to manage catering services and employees to pre-order launch and breakfast as early as a day before. Some of the features I implemented include integrating the applications authentication system 	with the company's login system. Integrating NFC cards with the system such that users simply swipe the card and their order information is displayed to the caterers.</p>,
                techStacks: [
                    "Python/Flask",
                    "Postgres",
                    "Redis"
                ]
            },
            {
                description: <p>Worked on a blogging platform called <b>Authors Haven</b> - A creative platform where authors can create blogs and build a following of readers that comment, like, favourite, and share the blogs on social media platforms. My main role on this was <b>Technical Team Lead (TTL)</b>, leading and guiding a team of developers to ensure a delivery of a robust application while following the industry best standards.</p>,
                techStacks: [
                    "Python/Django/Rest-Framework",
                    "React",
                    "React-Redux"
                ]
            }
        ],
    },
    {
        company: "MTN Uganda LTD, Kampala, Uganda",
        companyDescription: "MTN Uganda is the largest telecommunications service provider in Uganda. The key features/ functionalities that I performed/implemented include;",
        jobTitle: "Software Engineer (Intern)",
        duration: "06/2016 - 11/2017",
        roles: [
            <p>Designed and built a  <b>web-based monitoring</b> application that consolidated all data from all the  Watchdog monitoring devices from all the various data centres across East Africa in a single dashboard. This platform alerted responsible personnels incase the data centre conditions (Temperature, Humidity, Airflow etc) are beyond the set threshold values.</p>,
            <p>Parsed and dumped XML data into MySQL database</p>,
            <p>Visualised the dumped data using Chart.js to give trends into the data centres.</p>,
            <p>Built the admin dashboard to facilitate the overall application management.</p>
        ],
        otherRoles: [
            <p>Designed and built Value Added Service (VAS) applications.</p>,
            <p>Carried out network optimisation activities such as drive tests within the “complaint” area and came up with quick solutions.</p>,
            <p>Inspected fibre lines and accepted these fibre projects done by subcontractors within Kampala, inspection involved testing the fibre from one end, ensuring that are are no major losses within the transmission line, the physical appearance of the man-holes and did the final acceptance where necessary.</p>,
            <p>Surveyed the Arua-Koboko route for the laying new fibre line. This involved measuring the actual fibre route and taking note of obstacles such as drainage systems and rocky grounds.</p>
        ],
        techStacks: [
            "PHP",
            "MySQL"
        ]
    }
]

export default workExperienceData;