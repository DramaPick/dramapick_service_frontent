import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Person from "../components/Person";
import Button from "../components/Button";
import profile from "../assets/person_profile_test.png";
import styles from "../styles/PSelection.module.css";
import axios from "axios";

const PSelection = () => {
    const location = useLocation();
    const [selectedUsers, setSelectedUsers] = useState([]);
    const postVideoId = "1";

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

    const handleCompleteSelection = () => {
        console.log("선택된 사용자들:", selectedUsers);

        const data = {
            users: selectedUsers,
        };

        axios
            .post(`http://127.0.0.1:8000/api/videos/${postVideoId}/actors/select`, JSON.stringify(data), {
                headers: {
                    "Content-Type": "application/json",
                },
            })
            .then((response) => {
                console.log("서버 응답:", response.data);
            })
            .catch((error) => {
                console.error("서버 요청 오류:", error.response.data);
            });
    };

    // Person 컴포넌트에서 전달된 선택 상태를 부모에서 처리
    const handleSelectUser = (name, imgSrc, isSelected) => {
        if (isSelected) { // 체크되었을 때 해당 사용자 추가
            setSelectedUsers((prev) => [...prev, { name, imgSrc }]);
        } else { // 체크 해제되었을 때 해당 사용자 제거
            setSelectedUsers((prev) => prev.filter(user => user.name !== name));
        }
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
                <Person name="김수현1" imgSrc={profile} onSelect={handleSelectUser} ></Person>
                <Person name="김수현2" imgSrc={profile} onSelect={handleSelectUser} ></Person>
                <Person name="김수현3" imgSrc={profile} onSelect={handleSelectUser} ></Person>
                <Person name="김수현4" imgSrc={profile} onSelect={handleSelectUser} ></Person>
                <Person name="김수현5" imgSrc={profile} onSelect={handleSelectUser} ></Person>
                <Person name="김수현6" imgSrc={profile} onSelect={handleSelectUser} ></Person>
                <Person name="김수현7" imgSrc={profile} onSelect={handleSelectUser} ></Person>
                <Person name="김수현8" imgSrc={profile} onSelect={handleSelectUser} ></Person>
                <Person name="김수현9" imgSrc={profile} onSelect={handleSelectUser} ></Person>
            </div>
            <Button text="선택 완료" onClick={handleCompleteSelection}></Button>
        </div>
    );
};

export default PSelection;