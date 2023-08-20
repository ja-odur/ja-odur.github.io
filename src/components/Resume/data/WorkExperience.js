const workExperienceData = [
    {
        company: "MFS Africa",
        companyDescription: "MFS Africa is a financial technology company offering mobile financial solutions across Africa by enabling digital inter-operability. MFS Africa’s services allow its partners’ customers and SMEs to send and receive money across borders, payments instruments and agents (mobile wallet, card, bank account, and over the counter).",
        companyLocation: "Kampala, Uganda",
        duration: "Feb 2022 - present",
        titleRoles: [
            {
                title: "Senior Software Engineer - Beyonic",
                duration: "Apr 2023 - present",
                location: "Kampala, Uganda",
                description: "Beyonic is a secure, digital payment gateway in Uganda for small businesses. Allow customers to pay via a link, QR code, or in person.",
                roles: [
                    <p>Guiding the delivery of the application backend.</p>,
                    <p>Facilitating cross-team collaboration with Front-end, QA, UI/UX and Operations by providing back-end platform insights and issue resolution support.</p>,
                    <p>Actively generating ideas and engaging in brainstorming sessions to enhance product quality.</p>,
                    <p>Executing measures to reduce technical debt, enhancing backend inter-service communication and overall performance.</p>,
                    <p>Maintaining a vigilant focus on security and ongoing refactoring efforts.</p>,
                ],
            },
            {
                title: "Software Engineer - Beyonic",
                duration: "Feb 2022 - Mar 2023",
                location: "Kampala, Uganda",
                description: "Beyonic is a secure, digital payment gateway in Uganda for small businesses. Allow customers to pay via a link, QR code, or in person.",
                roles: [
                    <p>Leading the oversight and implementation of the Beyonic backend infrastructure on the Google Cloud Platform (GCP).</p>,
                    <p>Improving micro-services test-ability by refining the internal mocking library (bm-apis).</p>,
                    <p>Actively engaging in code review processes.</p>,
                    <p>Facilitating the integration of new team members into the project.</p>,
                ],
            },
        ],
        techStacks: [
            "Microservices",
            "Python/Django",
            "Rest Framework",
            "GCP",
        ]
    },
    {
        company: "AirQo",
        companyLocation: "Kampala, Uganda",
        companyDescription: "AirQo is Africa's leading air quality monitoring, research and analytics network. AirQo uses low cost technologies and AI to close the gaps in air quality data across the continent with a goal to find data-driven solutions to air quality challenges.",
        jobTitle: "Software Engineer",
        duration: "Aug 2020 - Jul 2022",
        titleRoles: [
            {
                title: "Software Engineer (Part-time)",
                duration: "jan 2022 - jul 2022",
                location: "Kampala, Uganda",
                roles: [
                    <p>Guiding the re-stacking and re-design of the AirQo website.</p>,
                    <p>Directing the modular transformation of the NetManager platform into distinct applications, including the device calibration service.</p>,
                    <p>Overseeing the advancement of AirQlouds dashboards, which involves categorizing monitoring devices into various scales of geographical areas to enhance analytical depth.</p>,
                    <p>Facilitating the integration of new team members into the project</p>,
                ],
            },
            {
                title: "Software Engineer",
                duration: "Aug 2020 - Jan 2022",
                location: "Kampala, Uganda",
                roles: [
                    <p>Assumed complete ownership of <b>NetManager</b> platform, facilitating device monitoring and air quality data visualization through heatmaps and charts.</p>,
                    <p>Enacted <b>mobile responsiveness</b> for the platform, simplifying its adoption by the hardware team.</p>,
                    <p>Collaborated closely with the Data Science team to <b>integrate heatmap and model calibration</b> features into the NetManager platform.</p>,
                    <p>Conducted training sessions for <b>selected local AirQommunity champions</b>, enabling them to utilize AirQo tools effectively for the purpose of raising awareness about air quality.</p>,
                    <p>Enhanced the <b>existing micro-service architecture</b>.</p>,
                    <p>Directed the implementation of <b>externally outsourced applications/tools</b> to external teams..</p>
                ],
            },
        ],
        roles: [
            <p>Assumed complete ownership of <b>NetManager</b> platform, facilitating device monitoring and air quality data visualization through heatmaps and charts.</p>,
            <p>Enacted <b>mobile responsiveness</b> for the platform, simplifying its adoption by the hardware team.</p>,
            <p>Collaborated closely with the Data Science team to <b>integrate heatmap and model calibration</b> features into the NetManager platform.</p>,
            <p>Conducted training sessions for <b>selected local AirQommunity champions</b>, enabling them to utilize AirQo tools effectively for the purpose of raising awareness about air quality.</p>,
            <p>Enhanced the <b>existing micro-service architecture</b>.</p>,
            <p>Directed the implementation of <b>externally outsourced applications/tools</b> to external teams..</p>
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
        duration: "Aug 2019 - Feb 2020",
        roles: [
            <p>Conducted <b>Database and Query Optimization</b> by identifying and optimizing sluggish query statements, enhancing report generation speed.</p>,
            <p>Developed a <b>Repository inspection interface</b> to validate and replicate customer repository-related concerns, aiding issue comprehension and resolution implementation.</p>,
            <p>Implemented <b>Partition-Based</b> queries to enhance API endpoint performance for clients dealing with extensive data.</p>,
            <p>Integrated <b>Deferred and Advanced filtering</b> to accommodate backend filtering logic complexities, facilitating efficient sorting of API data filtering/query parameters.</p>,
            <p>Utilized REST API endpoints to supply data across various application components.</p>,
            <p>Engaged in the testing of current API endpoints.</p>
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
        duration: "Jun 2018 - Jun 2020",
        nestedRoles: [
            {
                description: <p>Contributed to the development of an in-house company solution named <b>Activo</b>, a web application pivotal in inventory management, serving as the definitive repository for company asset status information. Noteworthy contributions include:</p>,
                roles: [
                    <p>Implemented Role-Based Authentication, affording diverse user access privileges to underlying resources.</p>,
                    <p>Evaluated and documented APIs through the utilization of Swagger.</p>,
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
                description: <p>Contributed to the development of <b>AndelaEats</b>, a web-based application designed to facilitate catering services management within the company. Additionally, enabled employees to conveniently pre-order lunches and breakfasts up to a day in advance. Key accomplishments encompassed:</p>,
                roles: [
                    <p>Seamless integration of the application's authentication system with the company's login mechanism.</p>,
                    <p>Successful integration of NFC cards into the system, streamlining user interaction by allowing card swiping to instantly display order details for caterers</p>,
                ],
                techStacks: [
                    "Python/Flask",
                    "Postgres",
                    "Redis"
                ]
            },
            {
                description: <p>Contributed to the development of <b>Authors Haven</b>, a blogging platform that serves as a creative space for authors to craft blogs and cultivate a readership engaged in activities such as commenting, liking, favoriting, and sharing content across social media channels. My primary responsibility within this project was that of a <b>Technical Team Lead (TTL)</b>, overseeing a team of developers to ensure the creation of a resilient application in accordance with industry best practices.</p>,
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
        duration: "jun 2016 - Nov 2017",
        roles: [
            <p>Devised and constructed a <b>web-based monitoring application</b>, harmonizing data from Watchdog monitoring devices situated across East African data centers into a unified dashboard. This platform proactively alerted relevant personnel in case conditions within the data centers, including temperature, humidity, and airflow, exceeded predetermined thresholds.</p>,
            <p>Processed XML data and systematically stored it in a MySQL database.</p>,
            <p>Employed Chart.js to visually represent the stored data, offering insights into data center trends.</p>,
            <p>Built an administrative dashboard, streamlining the application's comprehensive management.</p>
        ],
        otherRoles: [
            <p>Creation of Value Added Service (VAS) applications.</p>,
            <p>Execution of network optimization initiatives, which included conducting drive tests within areas flagged with concerns and promptly devising resolutions.</p>,
            <p>Thoroughly inspected and accepted fiber projects executed by subcontractors within Kampala. This encompassed comprehensive testing, assessment of transmission line losses, physical evaluation of manholes, and ultimate acceptance if deemed satisfactory.</p>,
            <p>Conducted a survey of the Arua-Koboko route to facilitate the installation of new fiber lines. This survey involved measuring the actual fiber route, identifying potential obstacles like drainage systems and rocky terrains, and documenting these details for reference.</p>
        ],
        techStacks: [
            "PHP",
            "MySQL"
        ]
    }
]

export default workExperienceData;