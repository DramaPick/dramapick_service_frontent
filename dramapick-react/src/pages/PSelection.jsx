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
    const [dramaTitle, setDramaTitle] = useState("");
    const [s3Url, setS3Url] = useState("");
    const [taskId, setTaskId] = useState("");
    const [status, setStatus] = useState("");
    const [representativeImages, setRepresentativeImages] = useState([]); // 대표 이미지 상태 추가
    const [sortedHighlights, setSortedHighlights] = useState([]);

    // eslint-disable-next-line
    const [actorProgress, setActorProgress] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    // eslint-disable-next-line
    const [error, setError] = useState("");  // 오류 처리

    const EC2_public_IP = process.env.REACT_APP_API_URL || "http://43.203.198.88:8000";

    // useEffect로 videoFile과 videoUrl을 한번만 설정
    useEffect(() => {
        if (location.state) {
            setS3Url(location.state.s3_url);
            setTaskId(location.state.task_id);
            setStatus(location.state.status);
            setDramaTitle(location.state.drama_title);
        } else {
            const storedS3Url = sessionStorage.getItem("s3_url");
            const storedTaskId = sessionStorage.getItem("task_id");
            const storedDramaTitle = sessionStorage.getItem("drama_title");

            if (storedS3Url) setS3Url(storedS3Url);
            if (storedTaskId) setTaskId(storedTaskId);
            if (storedDramaTitle) setDramaTitle(storedDramaTitle);
        }
    }, [location.state]); // location.state가 바뀔 때마다 실행

    useEffect(() => {
        const storedS3Url = sessionStorage.getItem("s3_url");
        const storedTaskId = sessionStorage.getItem("task_id");
        const storedDramaTitle = sessionStorage.getItem("drama_title");
    
        if (storedS3Url) setS3Url(storedS3Url);
        if (storedTaskId) setTaskId(storedTaskId);
        if (storedDramaTitle) setDramaTitle(storedDramaTitle);
    }, []);

    console.log("status: " + status + ", task_id: " + taskId + ", s3_url: " + s3Url + ", drama_title: " + dramaTitle);

    useEffect(() => {
        const storedImgS3Urls = sessionStorage.getItem("image_s3_urls");
        const storedSelectedUsers = sessionStorage.getItem("selected_users");
        const storedSortedHighlights = sessionStorage.getItem("sorted_highlights");
        if (storedImgS3Urls) {
            setRepresentativeImages(JSON.parse(storedImgS3Urls));
        } 
        if (storedSelectedUsers) {
            setSelectedUsers(JSON.parse(storedSelectedUsers));
        }
        if (storedSortedHighlights) {
            setSortedHighlights(JSON.parse(storedSortedHighlights));
        }
    }, []);

    useEffect(() => {
        if (representativeImages.length > 0) {
            sessionStorage.setItem("image_s3_urls", JSON.stringify(representativeImages));
        } 
        if (selectedUsers.length > 0) {
            sessionStorage.setItem("selected_users", JSON.stringify(selectedUsers));
        }
        if (sortedHighlights.length > 0) {
            sessionStorage.setItem("sorted_highlights", JSON.stringify(sortedHighlights));
        }
    }, [representativeImages, selectedUsers, sortedHighlights]);

    useEffect(() => {
        const handlePopState = () => {
            console.log("뒤로 가기 감지됨!");
            const storedImgS3Urls = sessionStorage.getItem("image_s3_urls");
            const storedSelectedUsers = sessionStorage.getItem("selected_users");

            if (storedImgS3Urls) {
                setRepresentativeImages(JSON.parse(storedImgS3Urls));
            }
            if (storedSelectedUsers) {
                setSelectedUsers(JSON.parse(storedSelectedUsers));
            }
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const navigate = useNavigate();

    useEffect(() => {
        if (s3Url && taskId) {
            console.log("Pselection.jsx ---> representativeImages: ", representativeImages.length);
            if (representativeImages.length === 0) {
                axios
                    .get(`${EC2_public_IP}/person/dc`, {
                        params: {
                            s3_url: s3Url,
                            task_id: taskId,
                        },
                    }).then((response) => {
                        const msg = response.data.message;
                        if (response.status === 200 && msg === "인물 감지와 클러스터링이 완료되었습니다.") {
                            setRepresentativeImages(response.data.image_urls); // 이미지 URL 배열 저장

                            sessionStorage.setItem("image_s3_urls", JSON.stringify(response.data.image_urls));
                        } else if (msg === "클러스터링된 인물이 존재하지 않습니다.") {
                            alert("클러스터링 된 인물이 존재하지 않습니다. 조금 더 긴 길이의 비디오를 업로드해주세요.");
                            navigate("/");
                        }
                    })
                    .catch((error) => {
                        console.error("API 호출 중 오류 발생:", error);
                    });
                }
            }
    }, [s3Url, taskId, representativeImages.length, navigate, EC2_public_IP]);

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
            .post(`${EC2_public_IP}/api/videos/${postVideoId}/actors/select`, JSON.stringify(data), {
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
                    navigate("/");
                }
                else if (response.data.status === "success") {
                    console.log(response.data.sorted_highlights);
                    sessionStorage.setItem("sorted_highlights", JSON.stringify(response.data.sorted_highlights));
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
    
    const handleSelectUser = (name, imgSrc, isSelected) => {
        setSelectedUsers((prev) => {
            if (isSelected) {
                if (!prev.some(user => user.name === name)) {
                    return [...prev, { name, imgSrc }];
                }
            } else {
                return prev.filter(user => user.name !== name);
            }
            return prev;
        });
    };

    const isUserSelected = (name) => {
        return selectedUsers.some(user => user.name === name);
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
                    <div style={{
                        position: "fixed",
                        top: "0",  // 화면 상단에 고정
                        left: "0",  // 화면 왼쪽에 고정
                        width: "100%",  // 전체 화면 너비
                        height: "100%",  // 전체 화면 높이
                        backgroundColor: "rgba(0, 0, 0, 0.3)",  // 배경을 반투명하게 (검정색 배경, 불투명도 0.3)
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9998
                    }}>
                    <div style={{
                        position: "fixed",
                        top: "55%",
                        left: "50%",
                        width: "15%",
                        height: "10%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: "#f4dbb3", 
                        color: "black",
                        padding: "20px",
                        borderRadius: "8px",
                        zIndex: 9999,
                        display: "flex",           // 부모 div를 flex 컨테이너로 설정
                        flexDirection: "column",   // 수직 정렬을 위해 column 방향으로 설정
                        justifyContent: "center",  // 수직 가운데 정렬
                        alignItems: "center"       // 수평 가운데 정렬
                    }}>
                        <progress style={{ width: "100%" }} />
                        <p>👥 인물 감지 및 클러스터링 진행 중입니다</p>
                    </div>
                    </div>
                )}
            </div>
            {showAlert && isProcessing && (
                <div style={{
                position: "fixed",
                top: "0",  // 화면 상단에 고정
                left: "0",  // 화면 왼쪽에 고정
                width: "100%",  // 전체 화면 너비
                height: "100%",  // 전체 화면 높이
                backgroundColor: "rgba(0, 0, 0, 0.3)",  // 배경을 반투명하게 (검정색 배경, 불투명도 0.3)
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9998
                }}>
                <div style={{
                    position: "fixed",
                    top: "55%",
                    left: "50%",
                    width: "17%",
                    height: "12%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "#f4dbb3", 
                    color: "black",
                    padding: "20px",
                    borderRadius: "8px",
                    zIndex: 9999,
                    display: "flex",           // 부모 div를 flex 컨테이너로 설정
                    flexDirection: "column",   // 수직 정렬을 위해 column 방향으로 설정
                    justifyContent: "center",  // 수직 가운데 정렬
                    alignItems: "center"       // 수평 가운데 정렬
                }}>
                    <progress style={{ width: "100%" }} />
                    <p>⏳ 선택한 등장인물 위주 쇼츠 생성 준비 중...</p>
                </div>
                </div>
            )}
            <Button text="선택 완료" onClick={handleCompleteSelection}></Button>
        </div>
    );
};

export default PSelection;