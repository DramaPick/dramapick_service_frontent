import React, {useState, useEffect} from "react";
import { getVideo } from '../services/awsService';
import styles from "../styles/Shorts.module.css";

const Shorts = (props) => {
    const { fileName, shortsNum, onCheckboxChange } = props;
    const [videoUrl, setVideoUrl] = useState(null);
    const [loading, setLoading] = useState(true); // 로딩 상태 관리
    const [isChecked, setIsChecked] = useState(false); // checkbox 클릭 상태 관리 

    const hashtag = "#김수현 #김지원\n#눈물의 여왕";

    console.log("fileName: "+fileName);

    useEffect(() => {
        const fetchVideo = async () => {
            const url = await getVideo(fileName);
            setVideoUrl(url);
            setLoading(false);  // 로딩 끝났으므로 false로 설정
        };
        fetchVideo();
    }, [fileName]);
    if (loading) {
        return <p>비디오를 불러오는 중...</p>;
    }
    if (!videoUrl) {
        return <p>!videoUrl</p>;
    }

    const handleCheckboxChange = (event) => {
        const checked = event.target.checked;
        setIsChecked(checked);
        onCheckboxChange(fileName, shortsNum, checked);  // 부모에게 상태 전달
    };

    return (
        <div className={styles.short_container}>
            <video controls>
                <source src={videoUrl} type="video/mp4"/>
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