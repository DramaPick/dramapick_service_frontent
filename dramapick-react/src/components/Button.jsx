import React from "react";
import styles from "../styles/Button.module.css";

const Button = (props) => {
    const {onClick, text} = props;

    return (
        <div className = {styles.buttondiv}>
            <button onClick={onClick}>{text}</button>
        </div>
    );
};

export default Button;