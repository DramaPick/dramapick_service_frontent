import axios from 'axios';

// axios 인스턴스 생성
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://43.203.198.88:8000",
  withCredentials: true
});

export default api;