import React from "react";
import styles from "../styles/Person.module.css";

const Person = (props) => {
const { name, imgSrc } = props;

    return (
        <div>
            <div className={styles.person_container}>
                <p>{name}</p>
                <img src={imgSrc} alt="Profile" className={styles.profile_image}/>
                <input type="checkbox" id="selection"/>
                <label htmlFor="selection"></label>
            </div>
        </div>
    );
};

export default Person;