import React, {useState, useEffect} from 'react';
import { getVideo } from '../services/awsService';

const ShortsDown = () => {
    const [videoUrl, setVideoUrl] = useState(null);
    const [loading, setLoading] = useState(true); // 로딩 상태 관리

    useEffect(() => {
        const fetchVideo = async () => {
            const url = await getVideo("1731241846_filename");
            setVideoUrl(url);
            setLoading(false);  // 로딩 끝났으므로 false로 설정
        };
        fetchVideo();
    }, []);
    if (loading) {
        return <p>비디오를 불러오는 중...</p>;
    }
    if (!videoUrl) {
        return <p>!videoUrl</p>;
    }
    return (
        <div>
            <video controls width="100%">
                <source src={videoUrl} type="video/mp4"/>
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

export default ShortsDown;