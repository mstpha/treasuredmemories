import { useState } from "react";
import axios from "axios";
import api from './../axiosConfig';
const MemoryModal = ({ isOpen, onClose, onSubmit, locationName,position}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);




  if (!isOpen) return null;

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (idToRemove) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== idToRemove);
      const removedImage = prev.find(img => img.id === idToRemove);
      if (removedImage) {
        URL.revokeObjectURL(removedImage.preview);
      }
      return filtered;
    });
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      alert('Please fill in all fields');
      return;
    }
  
    try {
      const memoryFormData = new FormData();
      memoryFormData.append('title', title);
      memoryFormData.append('description', description);
      memoryFormData.append('location', JSON.stringify({
        name: locationName,
        latitude: position.lat,
        longitude: position.lng
      }));
  
      const memoryResponse = await api.post('/memory', memoryFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
  
      if (memoryResponse.status === 201 && images.length > 0) {
        const memoryId = memoryResponse.data.id;
        const imageFormData = new FormData();
        
        images.forEach(image => {
          imageFormData.append('images', image.file);
        });
  
        await api.post(`/upload/multi/images/memory/${memoryId}`, imageFormData);      }
  
      onSubmit(memoryResponse.data);
      onClose();
      setTitle('');
      setDescription('');
      setImages([]);
    } catch (error) {
      console.error('Error:', error.response?.data || error);
      alert('Failed to create memory. Please try again.');
    }
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-[#1F1625] w-full max-w-lg rounded-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-white">Add Memory</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-300">{locationName}</p>
          
          {/* Title Input */}
          <div>
            <input
              type="text"
              placeholder="Memory Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 bg-[#2A1F33] border border-gray-700 rounded-lg 
                         text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
            />
          </div>

          {/* Description Input */}
          <div>
            <textarea
              placeholder="Memory Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 h-32 bg-[#2A1F33] border border-gray-700 rounded-lg 
                         text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 
                         resize-none"
            />
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block mb-2 text-gray-300">Add Images</label>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {images.map((img) => (
                <div key={img.id} className="relative group">
                  <img
                    src={img.preview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(img.id)}
                    className="absolute top-2 right-2 bg-black/50 p-1 rounded-full 
                               opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <label className="flex items-center justify-center px-4 py-2 bg-[#2A1F33] 
                             border border-gray-700 rounded-lg cursor-pointer 
                             hover:bg-[#372942] transition-colors">
              <span className="text-gray-300">Choose Images</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button 
            onClick={handleSubmit}
            className="w-full px-4 py-2 bg-[#2A1F33] text-white rounded-lg 
                     hover:bg-[#372942] transition-colors focus:outline-none"
          >
            Save Memory
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoryModal;