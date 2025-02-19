import React from "react";
import styles from "../styles/Person.module.css";

const Person = ({ name, imgSrc, onSelect, isSelected }) => {
    const handleCheckboxChange = (event) => {
        onSelect(name, imgSrc, event.target.checked);
    };

    return (
        <div className={styles.person_container} onClick={() => onSelect(name, imgSrc, !isSelected)}>
            <p>{name}</p>
            <img src={imgSrc} alt="Profile" className={styles.profile_image} />
            <input type="checkbox" checked={isSelected} onChange={handleCheckboxChange} id={`checkbox-${name}`} />
            <label htmlFor={`checkbox-${name}`}></label>
        </div>
    );
};

export default Person;