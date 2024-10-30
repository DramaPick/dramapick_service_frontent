import React from "react";
import { useNavigate } from 'react-router-dom';
import styles from "./Header.module.css";

const Header = () => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/'); // 메인 페이지로 이동
    };

    return (
        <header className={styles.header}>
            <h1 onClick={handleClick}>DramaPick</h1>
        </header>
    );
};

export default Header;