import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Person from "../components/Person";
import Button from "../components/Button";
import profile from "../assets/person_profile_test.png";
import styles from "../styles/PSelection.module.css";

const PSelection = () => {
    const location = useLocation();
    useEffect(() => {
        console.log(location);
    }, [location])
    const { videoFile, videoUrl } = location.state || {};
    const getEmbedUrl = (url) => {
        // eslint-disable-next-line
        const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        const match = url.match(youtubeRegex);
        if (match) {
            const videoId = match[1];
            return `https://www.youtube.com/embed/${videoId}`;
        }
        return url; // YouTube가 아닐 경우 원래 URL 반환
    };

    return (
        <div className={styles.pselection_div}>
            <h2>쇼츠 생성을 원하는 인물을 선택해주세요.</h2>
            <div className={styles.video_div}>
                {videoUrl ? (
                    <iframe
                        width="560"
                        height="315"
                        src={getEmbedUrl(videoUrl)}
                        title="Video"
                        frameBorder="0"
                        allowFullScreen
                    ></iframe>
                ) : videoFile ? (
                    <video width="560" height="315" controls>
                        <source src={URL.createObjectURL(videoFile)} type={videoFile.type} />
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <p>재생할 비디오가 없습니다.</p>
                )}
            </div>
            <div className={styles.profiles_div}>
                <Person name="김수현" imgSrc={profile}></Person>
                <Person name="김수현" imgSrc={profile}></Person>
            </div>
            <Button text="선택 완료"></Button>
        </div>
    );
};

export default PSelection;