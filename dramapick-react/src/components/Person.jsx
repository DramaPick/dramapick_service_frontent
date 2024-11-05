import React, {useState} from "react";
import styles from "../styles/Person.module.css";

const Person = (props) => {
    const { name, imgSrc, onSelect } = props;
    const [isSelected, setIsSelected] = useState(false);

    const handleCheckboxChange = (event) => {
        const selected = event.target.checked;
        setIsSelected(selected);
        onSelect(name, imgSrc, selected);
    };

    return (
        <div className={styles.person_container}>
            <p>{name}</p>
            <img src={imgSrc} alt="Profile" className={styles.profile_image}/>
            <input type="checkbox" checked={isSelected} onChange={handleCheckboxChange} id={`checkbox-${name}`} />
            <label htmlFor={`checkbox-${name}`}></label>
        </div>
    );
};

export default Person;