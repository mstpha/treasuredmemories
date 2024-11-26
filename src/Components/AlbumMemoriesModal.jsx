import React, { useState, useEffect } from 'react';
import api from './../axiosConfig';
import Memory from './Memory';
const AlbumMemoriesModal = ({ isOpen, onClose, albumId, albumTitle }) => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMemoryId, setSelectedMemoryId] = useState(null);
  useEffect(() => {
    if (isOpen && albumId) {
      fetchAlbumMemories();
    }
  }, [isOpen, albumId]);

  const fetchAlbumMemories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/album/memories/${albumId}`);
      
      // Correctly access the memories array from the response structure
      if (response.data.success && response.data.data?.memories) {
        setMemories(response.data.data.memories);
      } else {
        setMemories([]);
        setError('Invalid data structure received from server');
      }
    } catch (error) {
      console.error('Error fetching album memories:', error);
      setError('Failed to fetch memories');
      setMemories([]);
    } finally {
      setLoading(false);
    }
  };
  const unlinkMemFromAl = async (mem,alb)=>{
    try {
      const response = await api.delete(`/memory/${mem}/album/${alb}`)
      if (response.status===200 && response.data.success===true){
        fetchAlbumMemories()
      }
    }
    catch(err){
      console.log(err)
    }
   }
  const handleMemoryClick = (memoryId) => {
    setSelectedMemoryId(memoryId);
    setIsModalOpen(true);
  };
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[20000]">
      <div className="bg-[#1F1625] w-full max-w-2xl h-[80vh] rounded-lg shadow-2xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
        >
          ×
        </button>
        
        <div className="p-6 h-full flex flex-col">
          <h2 className="text-2xl font-bold text-white mb-4">{albumTitle}</h2>
          
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-white">Loading...</div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto">
              {memories.length === 0 ? (
                <p className="text-gray-400">No memories in this album yet.</p>
              ) : (
                <div className="space-y-4">
                  {memories.map(memory => {
                    // Parse the images JSON string
                    const memoryImages = JSON.parse(memory.images || '[]');
                    
                    return (
                      <div key={memory.id} className="bg-[#2A1F33] p-4 rounded-lg cursor-pointer hover:bg-[#3A2F43] transition-colors" onClick={() => handleMemoryClick(memory.id)}
>
                        <div className="flex justify-between">
                          <h3 className="text-white font-semibold">{memory.title}</h3>
                          <div onClick={()=>{unlinkMemFromAl(memory.id,albumId)}}>Unlink memory</div>
                          <span className="text-gray-400 text-sm">
                            {new Date(memory.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-300 mt-2">{memory.description}</p>
                        
                        {/* Images Grid */}
                        {memoryImages.length > 0 && (
                          <div className="mt-4 grid grid-cols-3 gap-2">
                            {console.log(memoryImages)}
                            {memoryImages.map((image, index) => (
                              <div 
                                key={index} 
                                className="aspect-square rounded overflow-hidden bg-gray-700"
                              >
                                <img
                                  src={"http://localhost:5000/"+image}
                                  alt={`Memory image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-2 text-sm text-gray-400">
                          <div>Likes: {memory.likeCounter}</div>
                          <div>Comments: {memory.commentCounter}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Memory 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        memoryId={selectedMemoryId}
        onMemoryDeleted={fetchAlbumMemories}
      />
    </div>
  );
};

export default AlbumMemoriesModal;