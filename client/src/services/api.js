import axios from 'axios';

const API=axios.create({
    baseURL:import.meta.env.VITE_API_URL || 'https://localhost:5000/api',
    withCredientials:true
});

//Movie APIs
export const movieAPI={
    getAll:(params)=>API.get('/movies',{params}),
    getById:(id)=>API.get(`/movies/${id}`),
    create:(data)=>API.post('/movies',data),
    update:(id,data)=> API.put(`/movies/${id}`,data),
    delete:(id)=>API.delete(`/movies/${id}`)
};

//Theater APIs
export const theaterAPI={
    getAll:()=> API.get('/theater'),
    getById:(id)=>API.get(`/theater/${id}`),
    create:(data)=>API.post('/theater',data)
};

export default API;
