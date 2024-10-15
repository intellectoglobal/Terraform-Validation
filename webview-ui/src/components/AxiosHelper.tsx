import axios from 'axios';


const baseURL = "http://localhost:3001";

const axiosInstance = axios.create({
    baseURL: baseURL,
    timeout: 200000,
    headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
    }
});

export default axiosInstance;
export { baseURL };