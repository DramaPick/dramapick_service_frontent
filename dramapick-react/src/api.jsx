import axios from 'axios';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://43.203.198.88:8000", // 환경 변수에서 API URL을 읽어오거나 기본 URL을 설정
});

export default api;