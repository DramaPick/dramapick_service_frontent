import React, { useRef, useEffect, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/Main.module.css";
import uploadIcon from "../assets/upload_icon.png";
import Button from "../components/Button";
import api from "../api";

const Main = () => {
  const inputEl = useRef(null);
  const [fileName, setFileName] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  // eslint-disable-next-line
  const [videoUrl, setVideoUrl] = useState("");
  const [dramaTitle, setDramaTitle] = useState("");
  const [error, setError] = useState("");

  // eslint-disable-next-line
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);

  const handleFileChange = useCallback((e) => {
    const files = e.target && e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const allowedExtensions = ['mov', 'mp4'];

      console.log("fileExtension: ", fileExtension);

      if (allowedExtensions.includes(fileExtension)) {
        setVideoFile(file);
        setFileName(file.name);
      } else {
        alert('지원하지 않는 파일 형식입니다. .mov 또는 .mp4 파일을 업로드해주세요.');
        setVideoFile(null);
        setFileName('');
        if (inputEl.current) {
          inputEl.current.value = '';
        }
      }
    } else {
      setVideoFile(null);
      setFileName('');
    }
  }, []);

  useEffect(() => {
    sessionStorage.clear(); // ✅ 세션 스토리지 초기화
  }, []);

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

    if (!videoFile && !videoUrl) {
      setError("비디오 파일 또는 URL 중 하나는 필수입니다.");
      return;
    }

    if (!dramaTitle) {
      setError("드라마 제목은 필수입니다.");
      return;
    }

    setError('');
    console.log('드라마 제목: ', dramaTitle);
    console.log('비디오 파일:', videoFile);
    console.log('비디오 URL:', videoUrl);
    
    // 드라마 타이틀 기반 크롤링 
    try {
      // eslint-disable-next-line
      const response = await api.get("/search", {
        params: { drama_title: dramaTitle },
      });
      console.log("검색 결과:", response.data);
      alert("드라마 정보를 성공적으로 가져왔습니다! 🎉");
    } catch (error) {
      if (error.response && error.response.status === 404) {
        setError('드라마 정보를 찾을 수 없습니다. 제목을 다시 확인해주세요.');
      } else {
        console.error("API 요청 중 오류 발생:", error);
        setError("오류가 발생했습니다. 다시 시도해주세요.");
      }
      return;
    }

    const formData = new FormData();
    if (videoFile) {
      formData.append('file', videoFile);
    }
    formData.append('dramaTitle', dramaTitle);

    setIsUploading(true);
    setShowAlert(true); 

    console.log("-- formData: ", formData);
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]); // key와 value 출력
    }

    try {
      const response = await api.post("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Access-Control-Allow-Origin": `http://dramapick-deploy-test.s3-website.ap-northeast-2.amazonaws.com`,
          "Access-Control-Allow-Credentials": "true",
        },
        onUploadProgress: (ProgressEvent) => {
          if (ProgressEvent.total) {
            const percent = Math.round((ProgressEvent.loaded * 100) / ProgressEvent.total);
            setUploadProgress(percent);
          }
        },
      }
    );
      console.log('Response from server:', response.data);

      const { task_id, status, s3_url } = response.data;

      navigate('/selection', {
        state: {
          video_file : videoFile,
          video_url : videoUrl,
          drama_title : dramaTitle,
          task_id : task_id,
          status : status,
          s3_url: s3_url
        }
      });

    } catch (error) {
      console.log('Error uploading video:', error);
      setError('비디오 업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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


  return (
    <div className={styles.maindiv}>
      <h2>쇼츠 생성을 원하는 비디오 파일을 업로드해주세요.</h2>
      <div className={styles.videoFile}>
        <div className={styles.container}>
          <label htmlFor="upload-file">
            <img src={uploadIcon} alt="Upload File" className={styles.uploadIcon} />
          </label>
          {fileName ? <span className={styles.showFileName}>{fileName}</span> : ""}
          <input type="file" accept="video/*" id="upload-file" onChange={handleFileChange} ref={inputEl} />
        </div>
        <p>업로드를 위해 위 버튼을 누르거나 비디오 파일을 여기로 전달해주세요.</p>
      </div>
      {/* 
      <div className={styles.videoURL}>
        <input type="url" value={videoUrl} onChange={handleUrlChange} placeholder="Youtube URL을 입력해주세요." />
        <p>ex. https://www.youtube.com/watch?v=mzSoALcmQKU</p>
      </div>
       */}
      <h2>드라마 제목을 입력해주세요.</h2>
      <div className={styles.titleContainer}>
        <p> 드라마 제목을 기반으로 한 크롤링을 통해 방영 기간, 방송사 및 드라마 제목을 쇼츠 하단에 자동으로 삽입해줍니다. </p>
        <div className={styles.title}>
          <input type="text" value={dramaTitle} onChange={handleTitleChange} placeholder="드라마 제목을 입력해주세요." required />
        </div>
      </div>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {showAlert && isUploading && (
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
            top: "40%",
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
            <p>📹 비디오 업로드 진행 중</p>
        </div>
        </div>
      )}
      <Button onClick={handleSubmit} text="업로드"></Button>
    </div>
  );
};

export default Main;