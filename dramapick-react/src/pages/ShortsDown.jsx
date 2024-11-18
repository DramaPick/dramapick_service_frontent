import React, { useState } from 'react';
import Shorts from '../components/Shorts';
import styles from "../styles/ShortsDown.module.css";
import Button from "../components/Button";
import axios from "axios";

const ShortsDown = () => {
    const [selectedVideos, setSelectedVideos] = useState([]); // 선택된 동영상들

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

        for (const name of fileNames) {
            const encodedFileName = encodeURIComponent(name);  // URL-safe 인코딩
            console.log("name : " + encodedFileName);

            try {
                // GET 요청 보내기
                const response = await axios.get(`http://127.0.0.1:8000/download_shorts?file_name=${encodedFileName}`, {
                    responseType: 'blob',  // 파일 다운로드이므로 blob 타입으로 설정
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
            }
        }
    };


    return (
        <div className={styles.main_div}>
            <h2>쇼츠 생성이 완료되었습니다. 원하는 쇼츠를 선택해 다운로드하세요.</h2>
            <div className={styles.container}>
                <Shorts fileName="1731255886_shorts04" shortsNum={1} onCheckboxChange={handleCheckboxChange}></Shorts>
                <Shorts fileName="1731255879_shorts03" shortsNum={2} onCheckboxChange={handleCheckboxChange}></Shorts>
                <Shorts fileName="1731255730_shorts01" shortsNum={3} onCheckboxChange={handleCheckboxChange}></Shorts>
                <Shorts fileName="1731255872_shorts02" shortsNum={4} onCheckboxChange={handleCheckboxChange}></Shorts>
            </div>
            <Button text="다운로드" onClick={handleDownloadClick}></Button>
        </div>
    );
};

export default ShortsDown;