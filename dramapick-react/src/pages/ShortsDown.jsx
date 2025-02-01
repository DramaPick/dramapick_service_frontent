import React, { useState, useEffect } from 'react';
import Shorts from '../components/Shorts';
import styles from "../styles/ShortsDown.module.css";
import Button from "../components/Button";
import axios from "axios";
import { useLocation } from 'react-router-dom';

const ShortsDown = () => {
    const location = useLocation();

    const [s3Url, setS3Url] = useState("");
    const [taskId, setTaskId] = useState("");
    const [sortedHighlights, setSortedHighlights] = useState([]);
    const [finalShortsS3Url, setFinalShortsS3Url] = useState([]);
    const [adjustedHighlights, setAdjustedHighlights] = useState([]);
    const [selectedVideos, setSelectedVideos] = useState([]); // 선택된 동영상들
    const [downloadProgress, setDownloadProgress] = useState(0); // 다운로드 진행 상태
    const [isDownloading, setIsDownloading] = useState(false); // 다운로드 진행 중 여부
    const [showAlert, setShowAlert] = useState(false); // 알림 표시 여부

    useEffect(() => {
        if (location.state) {
            setSortedHighlights(location.state.sorted_highlights);
            setS3Url(location.state.s3_url);
            setTaskId(location.state.task_id);
        }
    }, [location.state]); // location.state가 바뀔 때마다 실행

    useEffect(() => {
        if (sortedHighlights.length > 0 && s3Url && taskId) {
            // console.log("sortedHighlights: " + sortedHighlights + ", s3Url: " + s3Url + ", taskId: ", + taskId);
            // console.log("sortedHighlights type: " + getType(sortedHighlights));
            // console.log("일반 배열: " + [[48.32, 83.82], [127.21, 159.75]]);
            // console.log("s3Url type: " + getType(s3Url) + ", taskId type: " + getType(taskId));

            axios
                .post("http://127.0.0.1:8000/highlight/adjust", {
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
                    }
                })
                .catch((error) => {
                    console.error("API 호출 중 오류 발생:", error);
                });
        }
    }, [sortedHighlights, s3Url, taskId]);

    useEffect(() => {
        if (adjustedHighlights.length > 0 && s3Url && taskId) {

            axios
                .post("http://127.0.0.1:8000/highlights/save", {
                    s3_url: s3Url, // s3_url 문자열
                    task_id: taskId, // task_id 문자열
                    highlights: adjustedHighlights, // sortedHighlights 배열
                }, {
                    headers: {
                        "Content-Type": "application/json",
                    },
                })
                .then((response) => {
                    if (response.status === 200) {
                        console.log(response.data.message); // "최종 쇼츠 저장 완료"
                        setFinalShortsS3Url(response.data.s3_url_list);
                    }
                })
                .catch((error) => {
                    console.error("API 호출 중 오류 발생:", error);
                });
        }
    }, [adjustedHighlights, s3Url, taskId, sortedHighlights]);

    const handleCheckboxChange = (fileName, shortsNum, isChecked) => {
        setSelectedVideos((prevSelected) => {
            if (isChecked) {
                return [...prevSelected, { fileName, shortsNum }];
            } else {
                return prevSelected.filter(video => video.fileName !== fileName);
            }
        });
    };

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
                const response = await axios.get(`http://127.0.0.1:8000/download_shorts?file_name=${encodedFileName}`, {
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

    const closeAlert = () => {
        setShowAlert(false);
    };

    return (
        <div className={styles.main_div}>
            <h2>쇼츠 생성이 완료되었습니다. 원하는 쇼츠를 선택해 다운로드하세요.</h2>
            <div className={styles.container}>
                {adjustedHighlights.length === 0 ? (
                    <p style={{ color: "#003366" }}>인물 기반 하이라이트 구간 추출 중입니다...</p>
                ) : finalShortsS3Url.length === 0 ? (
                    <p style={{ color: "#003366" }}>최종 쇼츠 생성 중입니다...</p>
                ) : finalShortsS3Url.length > 0 ? (
                    finalShortsS3Url.map((url, index) => (
                        <Shorts
                            key={index}
                            fileName={url.split("/").pop()} // URL에서 파일 이름 추출
                            shortsNum={index + 1}
                            onCheckboxChange={handleCheckboxChange}
                        />
                    ))
                ) : (
                    <p>생성된 쇼츠가 없습니다.</p>
                )}
            </div>
            <Button text="다운로드" onClick={handleDownloadClick}></Button>
            {showAlert && isDownloading && (
                <div className={styles.alertBox}>
                    <div className={styles.alertContent}>
                        <p>다운로드 진행 중...</p>
                        <div className={styles.progressBarWrapper}>
                            <div className={styles.progressBar} style={{ width: `${downloadProgress}%` }} />
                        </div>
                        <button className={styles.closeAlertBtn} onClick={closeAlert}>닫기</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShortsDown;