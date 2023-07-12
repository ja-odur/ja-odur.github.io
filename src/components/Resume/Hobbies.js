function Hobbies({hobbies}) {
    return (
        <>
            {
                hobbies &&
                <>
                    <div className="resume-body-title"><span className="resume-body-pager"></span>Hobbies</div>
                    {
                        hobbies.map((hobby, hobbyID) => {
                            return (
                               <div className="hobby" key={hobbyID}>{hobby}</div>
                            )
                        })
                    }
                </>
            }

        </>
    );
}

export default Hobbies;
