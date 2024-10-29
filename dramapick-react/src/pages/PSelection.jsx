import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PSelection = () => {
    const location = useLocation();
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

    return (
        <div>
            <h2>쇼츠 생성을 원하는 인물을 선택해주세요.</h2>
            <div>
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
            <div>
                <h2>인물 선택 부분 #컴포넌트 예정</h2>
            </div>
            <button>선택 완료</button>
        </div>
    );
};

export default PSelection;