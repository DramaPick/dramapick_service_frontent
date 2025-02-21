import React, {useState, useEffect} from "react";
import styles from "../styles/Shorts.module.css";

const Shorts = ({fileName, s3Url, dramaTitle, shortsTitle, shortsNum, onCheckboxChange}) => {
    const [loading, setLoading] = useState(true); // 로딩 상태 관리
    const [isChecked, setIsChecked] = useState(false); // checkbox 클릭 상태 관리 

    let hashtag = `# ${dramaTitle}\n#${shortsTitle.replace('-', '')}`;
    if (shortsTitle === "") {
        hashtag = `# ${dramaTitle}\n`;
    }

    useEffect(() => {
        console.log("Shorts useEffect triggered! fileName: ", fileName);
        console.log("Shorts received s3Url:", s3Url);
        if (s3Url) {
            setLoading(false);
        } else {
            setLoading(true);
        }
    }, [s3Url, fileName]); // s3Url이 바뀔 때마다 업데이트

    if (loading) {
        return <p>비디오를 불러오는 중...</p>;
    }
    if (!s3Url) {
        return <p>!s3Url</p>;
    }

    const handleCheckboxChange = (event) => {
        const checked = event.target.checked;
        setIsChecked(checked);
        onCheckboxChange(fileName, shortsNum, checked);  // 부모에게 상태 전달
    };

    return (
        <div className={styles.short_container}>
            <video key={s3Url} controls>
                <source src={s3Url} type="video/mp4"/>
                Your browser does not support the video tag.
            </video>
            <div className={styles.description_container}>
                <div className={styles.oneline_container}>
                    <p className={styles.shorts_text}>Shorts#{shortsNum}</p>
                    <label className={styles.checkbox_label}>
                        <input 
                            type="checkbox" 
                            checked={isChecked} 
                            onChange={handleCheckboxChange} 
                        />
                    </label>
                </div>
                <p className={styles.hashtag_text}>{hashtag}</p>
            </div>
        </div>
    );
};

export default Shorts;