import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Person from "../components/Person";
import Button from "../components/Button";
import profile1 from "../assets/cluster_test1.jpg";
import profile2 from "../assets/cluster_test2.jpg";
import profile3 from "../assets/cluster_test3.jpg";
import styles from "../styles/PSelection.module.css";
import axios from "axios";

const PSelection = () => {
    const location = useLocation(); // location 훅으로 상태 가져오기
    const [selectedUsers, setSelectedUsers] = useState([]);
    const postVideoId = "1";
    // eslint-disable-next-line
    const [videoFile, setVideoFile] = useState(null);
    // eslint-disable-next-line
    const [videoUrl, setVideoUrl] = useState("");
    const [dramaTitle, setDramaTitle] = useState("");
    const [s3Url, setS3Url] = useState("");
    const [taskId, setTaskId] = useState("");
    const [status, setStatus] = useState("");


    // useEffect로 videoFile과 videoUrl을 한번만 설정
    useEffect(() => {
        if (location.state) {
            setVideoFile(location.state.video_file);
            setVideoUrl(location.state.video_url);
            setS3Url(location.state.s3_url);
            setTaskId(location.state.task_id);
            setStatus(location.state.status);
            setDramaTitle(location.state.drama_title);
        }
    }, [location.state]); // location.state가 바뀔 때마다 실행

    console.log("status: " + status + ", task_id: " + taskId + ", s3_url: " + s3Url + ", drama_title: " + dramaTitle);

    // eslint-disable-next-line
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

    const navigate = useNavigate();

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
                navigate('/shorts');
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
            <p>아래에서 원하는 인물을 선택하여 쇼츠 생성을 위한 캐스팅을 완료해주세요.</p>
            {/*
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
                        <source src={URL.createObjectURL(videoFile)} type={videoFile.type}/>
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <p>재생할 비디오가 없습니다.</p>
                )}
            </div>
            */}
            <div className={styles.profiles_div}>
                <Person name="백현우" imgSrc={profile1} onSelect={handleSelectUser} ></Person>
                <Person name="홍해인" imgSrc={profile2} onSelect={handleSelectUser} ></Person>
                <Person name="윤은성" imgSrc={profile3} onSelect={handleSelectUser} ></Person>
            </div>
            <Button text="선택 완료" onClick={handleCompleteSelection}></Button>
        </div>
    );
};

export default PSelection;