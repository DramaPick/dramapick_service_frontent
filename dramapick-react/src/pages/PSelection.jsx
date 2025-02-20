import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Person from "../components/Person";
import Button from "../components/Button";
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
    const [representativeImages, setRepresentativeImages] = useState([]); // 대표 이미지 상태 추가

    const [actorProgress, setActorProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    // eslint-disable-next-line
    const [error, setError] = useState("");  // 오류 처리

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

    useEffect(() => {
        if (s3Url) {
            axios
                .get("http://127.0.0.1:8000/person/dc", {
                    params: {
                        s3_url: s3Url,
                        task_id: taskId,
                    },
                }).then((response) => {
                    if (response.status === 200) {
                        console.log(response.data.message); // "인물 감지와 클러스터링이 완료되었습니다."
                        setRepresentativeImages(response.data.image_urls); // 이미지 URL 배열 저장
                    }
                })
                .catch((error) => {
                    console.error("API 호출 중 오류 발생:", error);
                });
            }
    }, [s3Url, taskId]);

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
            s3_url : s3Url,
            task_id: taskId,
            users: selectedUsers,
        };

        setIsProcessing(true);
        setShowAlert(true); 

        axios
            .post(`http://127.0.0.1:8000/api/videos/${postVideoId}/actors/select`, JSON.stringify(data), {
                headers: {
                    "Content-Type": "application/json",
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setActorProgress(percentCompleted);
                },
            })
            .then((response) => {
                console.log("서버 응답:", response.data);
                if (response.data.status === "no_highlight") {
                    alert("추출된 하이라이트가 없습니다. 더 긴 영상의 비디오를 업로드해주세요.");
                    navigate("/main");
                }
                else if (response.data.status === "success") {
                    console.log(response.data.sorted_highlights);
                    navigate('/shorts', { state: { sorted_highlights: response.data.sorted_highlights, task_id: taskId, s3_url: s3Url, drama_title: dramaTitle}});
                } else {
                    alert("쇼츠 생성에 포함시킬 인물을 선택해주세요.");
                }
            })
            .catch((error) => {
                console.error("서버 요청 오류:", error.response.data);
            }).finally(() => {
                setIsProcessing(false);
                setActorProgress(0);
            }); 
    };

    // Person 컴포넌트에서 전달된 선택 상태를 부모에서 처리
    /* const handleSelectUser = (name, imgSrc, isSelected) => {
        if (isSelected) { // 체크되었을 때 해당 사용자 추가
            setSelectedUsers((prev) => [...prev, { name, imgSrc }]);
        } else { // 체크 해제되었을 때 해당 사용자 제거
            setSelectedUsers((prev) => prev.filter(user => user.name !== name));
        }
    }; */
    
    const handleSelectUser = (name, imgSrc, isSelected) => {
        setSelectedUsers((prev) => {
            if (isSelected) {
                // 이미 선택된 사용자가 아니면 추가
                if (!prev.some(user => user.name === name)) {
                    return [...prev, { name, imgSrc }];
                }
            } else {
                // 선택 해제 시 제거
                return prev.filter(user => user.name !== name);
            }
            return prev;
        });
    };

    const isUserSelected = (name) => {
        return selectedUsers.some(user => user.name === name);
    };

    const closeAlert = () => {
        setShowAlert(false)
    };

    return (
        <div className={styles.pselection_div}>
            <h2>쇼츠 생성을 원하는 인물을 선택해주세요.</h2>
            <p>아래에서 원하는 인물을 선택하여 쇼츠 생성을 위한 캐스팅을 완료해주세요.</p>
            <div className={styles.profiles_div}>
                {representativeImages.length > 0 ? (
                    representativeImages.map((imageUrl, index) => {
                        const personName = `등장인물 ${index + 1}`; // ✅ 변수 선언 문제 없음!
                        return (
                            <Person
                                key={index}
                                name={personName}
                                imgSrc={imageUrl}
                                onSelect={handleSelectUser}
                                isSelected={isUserSelected(personName)}
                            />
                        );
                    })
                ) : (
                    <p style={{ color: "#003366" }}>인물 감지 및 클러스터링 진행 중입니다...</p>
                )}
            </div>
            {showAlert && isProcessing && (
                <div className={styles.alertBox}>
                  <div className={styles.alertContent}>
                    <p>쇼츠 등장 인물 처리 중...</p>
                    <div className={styles.progressBarWrapper}>
                      <div className={styles.progressBar} style={{ width: `${actorProgress}%` }} />
                    </div>
                    <button className={styles.closeAlertBtn} onClick={closeAlert}>닫기</button>
                  </div>
                </div>
            )}

            <Button text="선택 완료" onClick={handleCompleteSelection}></Button>
        </div>
    );
};

export default PSelection;