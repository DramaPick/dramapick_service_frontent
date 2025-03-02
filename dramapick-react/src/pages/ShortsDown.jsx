import React, { useState, useEffect, useRef } from 'react';
import Shorts from '../components/Shorts';
import styles from "../styles/ShortsDown.module.css";
import Button from "../components/Button";
import { useLocation } from 'react-router-dom';
import Modal from '../components/Modal';
import axios from "axios";

const ShortsDown = () => {
    const location = useLocation();

    const [s3Url, setS3Url] = useState("");
    const [taskId, setTaskId] = useState("");
    const [dramaTitle, setDramaTitle] = useState("");
    const [sortedHighlights, setSortedHighlights] = useState([]);
    const [finalShortsS3Url, setFinalShortsS3Url] = useState([]);
    const [adjustedHighlights, setAdjustedHighlights] = useState([]);
    const [selectedVideos, setSelectedVideos] = useState([]); // 선택된 동영상들
    // eslint-disable-next-line
    const [downloadProgress, setDownloadProgress] = useState(0); // 다운로드 진행 상태
    const [isDownloading, setIsDownloading] = useState(false); // 다운로드 진행 중 여부
    const [showAlert, setShowAlert] = useState(false); // 알림 표시 여부
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [shortsTitle, setShortsTitle] = useState(""); // 사용자 입력 쇼츠 제목 예시 
    const [errorMessage, setErrorMessage] = useState("");
    const [generatedTitles, setGeneratedTitles] = useState([]); // 생성된 쇼츠 제목 후보 
    const [selectedTitle, setSelectedTitle] = useState(""); // 선택한 최종 쇼츠 제목 저장
    const [errorMessageForOpenModal, setErrorMessageForOpenModal] = useState("");
    const [isLoading, setIsLoading] = useState(false); // 진행 상태 추가

    useEffect(() => {
        if (location.state) {
            sessionStorage.setItem("sorted_highlights", JSON.stringify(location.state.sorted_highlights));
            sessionStorage.setItem("s3_url", location.state.s3_url);
            sessionStorage.setItem("task_id", location.state.task_id);
            sessionStorage.setItem("drama_title", location.state.drama_title);

            setSortedHighlights(location.state.sorted_highlights);
            setS3Url(location.state.s3_url);
            setTaskId(location.state.task_id);
            setDramaTitle(location.state.drama_title);
        } else {
            // 새로고침 시 sessionStorage에서 복원
            const storedHighlights = sessionStorage.getItem("sorted_highlights");
            const storedS3Url = sessionStorage.getItem("s3_url");
            const storedTaskId = sessionStorage.getItem("task_id");
            const storedDramaTitle = sessionStorage.getItem("drama_title");

            if (storedHighlights) setSortedHighlights(JSON.parse(storedHighlights));
            if (storedS3Url) setS3Url(storedS3Url);
            if (storedTaskId) setTaskId(storedTaskId);
            if (storedDramaTitle) setDramaTitle(storedDramaTitle);
        }
    }, [location.state]); // location.state가 바뀔 때마다 실행

    useEffect(() => {
        const storedHighlights = sessionStorage.getItem("sorted_highlights");
        const storedS3Url = sessionStorage.getItem("s3_url");
        const storedTaskId = sessionStorage.getItem("task_id");
        const storedDramaTitle = sessionStorage.getItem("drama_title");

        if (storedHighlights) setSortedHighlights(JSON.parse(storedHighlights));
        if (storedS3Url) setS3Url(storedS3Url);
        if (storedTaskId) setTaskId(storedTaskId);
        if (storedDramaTitle) setDramaTitle(storedDramaTitle);
    }, []);

    useEffect(() => {
        const storedAdjustedHighlights = sessionStorage.getItem("adjustedHighlights");
        if (storedAdjustedHighlights !== null) {
            setAdjustedHighlights(JSON.parse(storedAdjustedHighlights));
        }

        const storedFinalShortsS3Url = sessionStorage.getItem("finalShortsS3Url");
        if (storedFinalShortsS3Url !== null) {
            setFinalShortsS3Url(JSON.parse(storedFinalShortsS3Url));
        }
    }, []);

    useEffect(() => {
        if (adjustedHighlights.length > 0) {
            sessionStorage.setItem("adjustedHighlights", JSON.stringify(adjustedHighlights));
        }

        if (finalShortsS3Url.length > 0) {
            sessionStorage.setItem("finalShortsS3Url", JSON.stringify(finalShortsS3Url));
        }
    }, [adjustedHighlights, finalShortsS3Url]);

    const adApiCallRef = useRef(0);
    useEffect(() => {
        if (sortedHighlights.length > 0 && s3Url && taskId) {
            
            const savedAdjustedHighlights = JSON.parse(sessionStorage.getItem("adjustedHighlights"));
            console.log("===> savedAdjustedHighlights: ", savedAdjustedHighlights);
            console.log("===> adjustedHighlights length: ", adjustedHighlights.length);
            console.log("adApiCallRef: ", adApiCallRef.current);
            
            if (adApiCallRef.current === 0 && adjustedHighlights.length === 0) {
                axios.post("https://0k6m4u1tdj.execute-api.us-east-1.amazonaws.com/api/highlight/adjust", {
                        s3_url: s3Url, // s3_url 문자열
                        task_id: taskId, // task_id 문자열
                        highlights: sortedHighlights, // sortedHighlights 배열
                    }, {
                        headers: {
                            "Content-Type": "application/json", // JSON 형식으로 전송
                        },
                    })
                    .then((response) => {
                        if (response.status === 200) {
                            console.log(response.data.message); // "하이라이트 조정이 완료되었습니다."
                            setAdjustedHighlights(response.data.adjusted_highlights);

                            sessionStorage.setItem("adjustedHighlights", JSON.stringify(response.data.adjusted_highlights));

                            adApiCallRef.current += 1;
                        }
                    })
                    .catch((error) => {
                        console.error("API 호출 중 오류 발생:", error);
                    }
                );
            } 
        }
    }, [sortedHighlights, s3Url, taskId, dramaTitle, adjustedHighlights]);

    const finalApiCall = useRef(0);
    useEffect(() => {
        if (adjustedHighlights.length > 0 && sortedHighlights && s3Url && taskId) {
            
            const savedFinalShortsS3Url = JSON.parse(sessionStorage.getItem("finalShortsS3Url"));
            console.log("===> savedFinalShortsS3Url: ", savedFinalShortsS3Url);
            console.log("===> finalShortsS3Url length: ", finalShortsS3Url.length);
            console.log("finalApiCall: ", finalApiCall.current);
            
            if (finalApiCall.current === 0 && finalShortsS3Url.length === 0) {
                axios.post("https://0k6m4u1tdj.execute-api.us-east-1.amazonaws.com/api/highlights/save", {
                        s3_url: s3Url, // s3_url 문자열
                        task_id: taskId, // task_id 문자열
                        drama_title: dramaTitle,
                        adjusted_highlights: adjustedHighlights, // sortedHighlights 배열
                    }, {
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })
                    .then((response) => {
                        if (response.status === 200) {
                            console.log(response.data.message); // "최종 쇼츠 저장 완료"
                            setFinalShortsS3Url(response.data.s3_url_list);
                            sessionStorage.setItem("finalShortsS3Url", JSON.stringify(response.data.s3_url_list));

                            finalApiCall.current += 1;
                        }
                    })
                    .catch((error) => {
                        console.error("API 호출 중 오류 발생:", error);
                    });
            }
        }
    }, [adjustedHighlights, s3Url, taskId, dramaTitle, sortedHighlights, finalShortsS3Url]);

    const handleCheckboxChange = (fileName, shortsNum, isChecked) => {
        setSelectedVideos((prevSelected) => {
            if (isChecked) {
                return [...prevSelected, { fileName, shortsNum }];
            } else {
                return prevSelected.filter(video => video.fileName !== fileName);
            }
        });
    };

    const openModal = () => {
        if (selectedVideos.length === 1) {
            console.log("-----> open modal : ", selectedVideos);
            if (selectedVideos.every(video => video.fileName.includes("ai_title"))) {
                alert("이미 생성된 제목이 존재하는 쇼츠입니다. 다른 쇼츠를 생성해주세요.");
                return;
            }
            setIsModalOpen(true);
            setErrorMessageForOpenModal("");
        } else if (selectedVideos.length === 0) {
            setErrorMessageForOpenModal("제목 생성을 원하는 하나의 쇼츠를 선택해주세요.");
        } else {
            setErrorMessageForOpenModal("제목 생성의 경우 하나의 쇼츠만 선택해야 합니다.");
        }
    };
    const closeModal = () => setIsModalOpen(false);

    const handleDownloadClick = async () => {
        if (selectedVideos.length === 0) {
            console.log("선택된 동영상이 없습니다.");
            return;
        }

        setIsDownloading(true);
        setShowAlert(true);  // 다운로드 진행 중 알림 표시

        const fileNames = selectedVideos.map(video => video.fileName.endsWith(".mp4") ? video.fileName : video.fileName + ".mp4");
        console.log("fileNames: " + fileNames);

        for (const name of fileNames) {
            const encodedFileName = encodeURIComponent(name);  // URL-safe 인코딩
            console.log("name : " + encodedFileName);

            try {
                const response = await axios.get(`https://0k6m4u1tdj.execute-api.us-east-1.amazonaws.com/api/download_shorts?file_name=${encodedFileName}`, {
                    responseType: 'blob',
                    onDownloadProgress: (progressEvent) => {
                        if (progressEvent.total) {
                            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                            setDownloadProgress(percent);
                        }
                    }
                });

                // 다운로드 처리
                const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', name);
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                console.log(`${name} 다운로드 완료`);
            } catch (error) {
                console.error(`${name} 다운로드 중 오류 발생:`, error);
            }
        }
        setIsDownloading(false);
        setDownloadProgress(0);
    };

    const handleShortsTitleGen = async () => {
        if (!shortsTitle.trim()) {
            setErrorMessage("쇼츠 제목을 입력해주세요."); // 빨간 글씨 에러 메시지 설정
            return;
        }

        setErrorMessage(""); 
        setGeneratedTitles([]);
        setSelectedTitle("");

        try {
            const selectedFileName = selectedVideos[0].fileName;
            console.log("selectedFileName: ", selectedFileName);

            const response = await axios.post("https://0k6m4u1tdj.execute-api.us-east-1.amazonaws.com/api/highlight/title", null, {
                params: { org_title: shortsTitle, file_name: selectedFileName},
            });
            if (response.data.message === "title 추출 완료") {
                console.log("제목 생성 완료!");
                console.log(response.data.file_name);
                const titlesArray = response.data.titles[0].split("\n").map(title => title.replace(/^\d+\.\s*/, ""));
                setGeneratedTitles(titlesArray);
            }
        } catch (error) {
            console.error("API 요청 중 오류 발생:", error);
            setErrorMessage("제목 생성에 실패했습니다. 다시 시도해주세요.");
        }
    };

    const handleSubmitSelectedTitle = async () => {
        if (!selectedTitle) {
            alert("제목을 선택해주세요!");
            return;
        }

        console.log("selectedTitle: ", selectedTitle);
        setIsLoading(true);

        try {
            const selectedFileName = selectedVideos[0].fileName;
            console.log("selectedFileName 222 : ", selectedFileName);
            const response = await axios.post("https://0k6m4u1tdj.execute-api.us-east-1.amazonaws.com/api/submit/title", null, {
                params: {selected_title: selectedTitle, file_name: selectedFileName},
            });
            if (response.data.message === "title 삽입 완료") {
                setIsLoading(false);
                alert("🎉 쇼츠에 제목 삽입이 완료되었습니다!");
                const s3_url_with_title = response.data.s3_url_with_title;
                console.log("s3_url_with_title: ", s3_url_with_title);
                // 기존의 s3_url 대신 대체해야 함 (finalShortsS3Url 리스트에서 selectedFileName이 포함된 s3 url 대신 s3_url_with_title을 넣어야 함)
                console.log("Before mapping: ", finalShortsS3Url);
                const bucket_name = "test-fastapi-bucket";
                setFinalShortsS3Url((prevUrls) => {
                    console.log("Before update:", prevUrls);
                    const updatedUrls = prevUrls.map(url =>
                        url === `https://${bucket_name}.s3.ap-northeast-2.amazonaws.com/${selectedFileName}`
                            ? s3_url_with_title
                            : url
                    );
                    console.log("After update:", updatedUrls);
                    return updatedUrls;
                });
                console.log("After mapping: ", finalShortsS3Url);
                setSelectedVideos((prevSelected) => {
                    return prevSelected.map(video =>
                        video.fileName === selectedFileName
                            ? { ...video, fileName: s3_url_with_title.split('/').pop() }
                            : video
                    );
                });
                closeModal();
            }
        } catch (error) {
            console.error("제목 제출 중 오류 발생:", error);
            alert("제목 제출에 실패했습니다.");
        }
    };

    return (
        <div className={styles.main_div}>
            <h2>쇼츠 생성이 완료되었습니다. 원하는 쇼츠를 선택해 다운로드하세요.</h2>
            <div className={styles.container}>
                {adjustedHighlights?.length === 0 ? (
                    <div style={{
                        position: "fixed",
                        top: "0",  // 화면 상단에 고정
                        left: "0",  // 화면 왼쪽에 고정
                        width: "100%",  // 전체 화면 너비
                        height: "100%",  // 전체 화면 높이
                        backgroundColor: "rgba(0, 0, 0, 0.3)",  // 배경을 반투명하게 (검정색 배경, 불투명도 0.7)
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9998  // progress 바 위로 올리기 위해 zIndex를 조정
                    }}>
                    <div style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        width: "15%",
                        height: "10%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: " #f4dbb3", 
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
                        <p>🎞️ 인물 기반 하이라이트 구간 추출 중...</p>
                    </div>
                    </div>
                ) : finalShortsS3Url?.length === 0 ? (
                    <div style={{
                        position: "fixed",
                        top: "0",  // 화면 상단에 고정
                        left: "0",  // 화면 왼쪽에 고정
                        width: "100%",  // 전체 화면 너비
                        height: "100%",  // 전체 화면 높이
                        backgroundColor: "rgba(0, 0, 0, 0.3)",  // 배경을 반투명하게 (검정색 배경, 불투명도 0.7)
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        zIndex: 9998  // progress 바 위로 올리기 위해 zIndex를 조정
                    }}>
                    <div style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        width: "20%",
                        height: "15%",
                        transform: "translate(-50%, -50%)",
                        backgroundColor: " #f4dbb3", 
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
                        <p>⌛️ 드라마 정보 삽입 및 쇼츠 추출 중</p>
                        <p>쇼츠 하나를 생성하는 데 평균적으로 3분이 소요됩니다.</p>
                    </div>
                    </div>
                ) : finalShortsS3Url?.length > 0 ? (
                    finalShortsS3Url.map((url, index) => (
                        <Shorts
                            key={index}
                            fileName={url.split("/").pop()} // URL에서 파일 이름 추출
                            s3Url={url}
                            dramaTitle = {dramaTitle}
                            shortsTitle = {selectedTitle}
                            shortsNum={index + 1}
                            onCheckboxChange={handleCheckboxChange}
                        />
                    ))
                ) : (
                    <p>생성된 쇼츠가 없습니다.</p>
                )}
            </div>
            <Button text="다운로드" onClick={handleDownloadClick} />
            <Button text="AI로 쇼츠 제목 생성하기" onClick={openModal} />
            {errorMessageForOpenModal && <p style={{ color: "red", marginTop: "8px" }}>{errorMessageForOpenModal}</p>}
            {showAlert && isDownloading && (
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    width: "15%",
                    height: "10%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: " #f4dbb3", 
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
                    <p>🎬 쇼츠 다운로드 중...</p>
                </div>
            )}
            <Modal isOpen={isModalOpen} onClose={closeModal}>
                <h3>AI로 쇼츠 제목 생성하기</h3>
                <p>원하는 쇼츠 제목 예시 하나를 작성하고 생성 버튼을 클릭하면 해당 내용을 기반으로 한 새로운 쇼츠 제목 5가지가 생성됩니다.</p>
                <input type="text" value={shortsTitle} onChange={(e) => setShortsTitle(e.target.value)} placeholder="제목을 입력하세요"/>
                {errorMessage && <p style={{ color: "red", fontSize: "14px" }}>{errorMessage}</p>}
                {generatedTitles.length > 0 && (
                    <div style={{ marginTop: "20px"}}>
                        <h4>생성된 제목 (쇼츠 상단에 삽입할 하나를 선택하세요)</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                        {generatedTitles.map((title, index) => (
                            <div key={index} style={{paddingBottom: "2px", display: "flex", alignItems: "center", justifyContent: "flex-start", gap: "8px", width: "100%"}}>
                                <label style={{display: "flex", alignItems: "baseline", gap: "7px", whiteSpace: "nowrap"}}>
                                    <input 
                                        type="radio" 
                                        name="shortsTitle" 
                                        value={title} 
                                        checked={selectedTitle === title} 
                                        onChange={(e) => setSelectedTitle(e.target.value)} 
                                    />
                                <span>{title.replace(/"/g, '').replace('-', '')}</span>
                                </label>
                            </div>
                        ))}
                        </div>
                        <button onClick={handleSubmitSelectedTitle}>선택</button>
                    </div>
                )}
                <button onClick={handleShortsTitleGen}>생성</button>
            </Modal>
            {isLoading && (
                <div style={{
                    position: "fixed",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: "17%",
                    height: "12%",
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
                    <p>📍 제목 삽입 중...</p>
                    <p>최대 2분 소요될 수 있습니다.</p>
                </div>
            )}
        </div>
    );
};

export default ShortsDown;