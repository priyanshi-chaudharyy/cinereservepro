const handleSubmit = async (e) => {
  e.preventDefault();
  console.log("1. Form submission started");

  try {
    const uploadData = new FormData();
    // CRITICAL: The key must be 'image' to match your backend
    uploadData.append('image', file); 

    console.log("2. Sending image to backend...");
    const imgRes = await api.post('/api/upload/image', uploadData);
    console.log("3. Image upload success:", imgRes.data);

    const moviePayload = {
      title: formData.title,
      description: formData.description,
      genre: formData.genre, 
      posterUrl: imgRes.data.data.url, // Note the nested 'data.data' based on your controller
      posterPublicId: imgRes.data.data.publicId
    };

    console.log("4. Creating movie in DB with payload:", moviePayload);
    await api.post('/api/movies', moviePayload);
    
    alert("Success! Movie added.");
  } catch (err) {
    console.error("❌ ERROR AT STEP:", err.response?.status || "Network");
    console.error("Error Detail:", err.response?.data || err.message);
    alert("Failed: " + (err.response?.data?.message || "Check console"));
  }
};
export default AddMovie;