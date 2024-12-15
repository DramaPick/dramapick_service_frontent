import React, { useState } from 'react';
import Shorts from '../components/Shorts';
import styles from "../styles/ShortsDown.module.css";
import Button from "../components/Button";
import axios from "axios";

const ShortsDown = () => {
    const [selectedVideos, setSelectedVideos] = useState([]); // 선택된 동영상들
    const [downloadProgress, setDownloadProgress] = useState(0); // 다운로드 진행 상태
    const [isDownloading, setIsDownloading] = useState(false); // 다운로드 진행 중 여부
    const [showAlert, setShowAlert] = useState(false); // 알림 표시 여부

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

        const fileNames = selectedVideos.map(video => video.fileName + ".mp4");
        console.log("fileNames: " + fileNames);
        console.log(`http://127.0.0.1:8000/download_shorts?file_names=${fileNames}`);

        setIsDownloading(true);
        setShowAlert(true);  // 다운로드 진행 중 알림 표시

        for (const name of fileNames) {
            const encodedFileName = encodeURIComponent(name);  // URL-safe 인코딩
            console.log("name : " + encodedFileName);

            try {
                // GET 요청 보내기
                const response = await axios.get(`http://127.0.0.1:8000/download_shorts?file_name=${encodedFileName}`, {
                    responseType: 'blob',  // 파일 다운로드이므로 blob 타입으로 설정
                    onDownloadProgress: (ProgressEvent) => {
                    if (ProgressEvent.total) {
                        const percent = Math.round((ProgressEvent.loaded * 100) / ProgressEvent.total);
                        setDownloadProgress(percent);  // 진행률 업데이트
                    }
                }
                });

                // 파일 다운로드 처리 (파일 이름을 그대로 사용해서 다운로드)
                const downloadUrl = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.setAttribute('download', encodedFileName);  // 다운로드할 파일 이름 설정
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                console.log(`${encodedFileName} 다운로드 완료`);
            } catch (error) {
                console.error(`${encodedFileName} 다운로드 중 오류 발생:`, error);
            } finally {
                setIsDownloading(false);
                setDownloadProgress(0);
            }
        }
    };

    const closeAlert = () => {
        setShowAlert(false);
    };

    return (
        <div className={styles.main_div}>
            <h2>쇼츠 생성이 완료되었습니다. 원하는 쇼츠를 선택해 다운로드하세요.</h2>
            <div className={styles.container}>
                <Shorts fileName="shorts001" shortsNum={1} onCheckboxChange={handleCheckboxChange}></Shorts>
                <Shorts fileName="shorts002" shortsNum={2} onCheckboxChange={handleCheckboxChange}></Shorts>
                <Shorts fileName="shorts003" shortsNum={3} onCheckboxChange={handleCheckboxChange}></Shorts>
                <Shorts fileName="shorts004" shortsNum={4} onCheckboxChange={handleCheckboxChange}></Shorts>
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