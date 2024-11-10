import React, {useRef, useEffect, useCallback, useState} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styles from "../styles/Main.module.css";
import uploadIcon from "../assets/upload_icon.png";
import Button from "../components/Button";

const Main = () => {
    const inputEl = useRef(null);
    const [fileName, setFileName] = useState("");
    const [videoFile, setVideoFile] = useState(null);
    const [videoUrl, setVideoUrl] = useState('');
    const [dramaTitle, setDramaTitle] = useState('');
    const [error, setError] = useState('');


    const handleFileChange = useCallback ((e)=> {
        const files = e.target && e.target.files;
        if (files && files[0]) {
            setVideoFile(e.target.files[0]);
            setFileName(e.target.files[0].name);
        } else {
            setVideoFile(null);
            setFileName('');
        }
    }, []);

    const handleUrlChange = (e) => {
        setVideoUrl(e.target.value);
    };

    const handleTitleChange = (e) => {
        setDramaTitle(e.target.value);
    };

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (videoFile && videoUrl) {
            setError("비디오 파일과 URL 중 하나만 입력해야 합니다.");
            return;
        }
        if(!videoFile && !videoUrl) {
            setError("비디오 파일 또는 URL 중 하나는 필수입니다.");
            return;
        }
        if(!dramaTitle) {
            setError("드라마 제목은 필수입니다.");
            return;
        }

        setError('');
        console.log('드라마 제목: ',dramaTitle);
        console.log('비디오 파일:', videoFile);
        console.log('비디오 URL:', videoUrl);

        const formData = new FormData();
        if (videoFile) {
            formData.append('file', videoFile);
        }
        if (videoUrl) {
            formData.append('videoUrl', videoUrl);
        }
        formData.append('dramaTitle', dramaTitle);

        try {
            const response = await axios.post('http://127.0.0.1:8000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                maxRedirects: 0,
            });
            console.log('Response from server:', response.data)

            navigate('/selection', {
                state: {videoFile, videoUrl, dramaTitle}
            });
        } catch(error) {
            console.log('Error uploading video:', error)
            setError('비디오 업로드에 실패했습니다. 다시 시도해주세요.')
        }
    };

    useEffect(() => {
        const currentInputEl = inputEl.current;
        if (currentInputEl !== null) {
            currentInputEl.addEventListener("input", handleFileChange);
        }
        return () => {
            currentInputEl && currentInputEl.removeEventListener("input", handleFileChange);
        };
    }, [inputEl, handleFileChange]);


    // 모든 비디오 형식 수용(accept)
    return (
        <div className={styles.maindiv}>
            <h2>쇼츠 생성을 원하는 비디오 파일 혹은 비디오의 Youtube URL을 업로드해주세요.</h2>
            <div className={styles.videoFile}>
                <div className={styles.container}>
                    <label htmlFor="upload-file">
                        <img src={uploadIcon} alt="Upload File" className={styles.uploadIcon} />
                    </label>
                    {fileName? <span className={styles.showFileName}>{fileName}</span>: ""}
                    <input type="file" accept="video/*" id="upload-file" onChange={handleFileChange} ref={inputEl} /> 
                </div>
                <p>업로드를 위해 위 버튼을 누르거나 비디오 파일을 여기로 전달해주세요.</p>
            </div>
            <div className={styles.videoURL}>
                <input type="url" value={videoUrl} onChange={handleUrlChange} placeholder="Youtube URL을 입력해주세요." />
                <p>ex. https://www.youtube.com/watch?v=mzSoALcmQKU</p>
            </div>
            <h2>드라마 제목을 입력해주세요.</h2>
            <div className={styles.title}>
                <input type="text" value={dramaTitle} onChange={handleTitleChange} placeholder="드라마 제목을 입력해주세요." required />
            </div>
            {error && <p style={{color:'red'}}>{error}</p>}
            <Button onClick={handleSubmit} text="업로드"></Button>
        </div>
    );
}

export default Main;