import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import api from "./../axiosConfig";
import { useUser } from '../context/userContext';
function MemoryList({ isOpen, onClose,map }) {
  const [memories, setMemories] = useState([]);
  const [userData, setUserData] = useState(null);
  const { memid, disableMap, enableMap } = useUser();  

  // Fetch memories and user data
  useEffect(() => {
    const fetchData = async () => {
      if (!memid) return;
      
      try {
        // Fetch memories for specific user
        const memoriesResponse = await api.get(`/memory/user/${memid}`);
        if (memoriesResponse.status === 200) {
          setMemories(memoriesResponse.data);
        }

        // Fetch user data
        const userResponse = await api.get(`/profile/${memid}`);
        if (userResponse.status === 200) {
          setUserData(userResponse.data.user);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    if (isOpen && memid) {
      fetchData();
    }
  }, [isOpen, memid]);

  useEffect(() => {
    if (isOpen) {
      disableMap(); 
    } else {
      enableMap(); 
    }
    return () => enableMap();
  }, [isOpen, disableMap, enableMap]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]"  onClick={(e) => e.stopPropagation()} >
      <div className="bg-[#1F1625] w-full max-w-3xl h-[90vh] rounded-lg shadow-2xl relative overflow-hidden">
        <div onClick={() => {
            onClose();
            enableMap();
          }}  className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl cursor-pointer z-50">
          ×
        </div>

        <div className="h-full flex flex-col p-6 overflow-y-auto scrollbar-hide" 
        onClick={(e) => e.stopPropagation()} 
        >
          <h2 className="text-2xl font-bold text-white mb-6">
            {userData?.username}'s Memories
          </h2>
          
          <div className="space-y-8">
          {memories.map((memory) => (
            <MemoryCard 
              key={memory.id} 
              memory={memory} 
              userData={userData}
              map={map}    
              onClose={onClose} 
            />
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MemoryCard({ memory, userData, map, onClose }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = JSON.parse(memory.images || '[]');
  const handleMemoryClick = () => {
    if (map && memory.Location) {
      const lat = parseFloat(memory.Location.latitude);
      const lng = parseFloat(memory.Location.longitude);
      map.setView([lat, lng], 15);  // 15 is zoom level, adjust as needed
      onClose();  // Close the modal after setting view
    }
  };
  const nextImage = (e) => {
    e.stopPropagation(); // Stop the click from bubbling up

    setCurrentImageIndex(prev => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = (e) => {
    e.stopPropagation(); // Stop the click from bubbling up

    setCurrentImageIndex(prev => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    <div className="bg-[#2A1F33] rounded-lg overflow-hidden" 
    onClick={handleMemoryClick}
>
      <div className="p-4 flex items-center gap-3">
        <img
          src={`http://localhost:5000/${userData?.Profile?.avatarImage}` || "/logo.png"}
          alt="Profile"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <h3 className="text-white font-semibold">
            {memory.title}
          </h3>
          <p className="text-gray-400 text-sm">
            Posted by {userData?.username || 'Unknown User'}
          </p>
        </div>
      </div>

      <div className="relative w-full aspect-video">
        <img
          src={images[currentImageIndex]?`http://localhost:5000/${images[currentImageIndex]}`:"/logo.png"}
          alt={`Memory ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
        />
        {images.length > 1 && (
          <>
            <button 
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
            >
              <ChevronRight size={24} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {images.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentImageIndex ? 'bg-white' : 'bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-4 flex items-center gap-2">
        <Heart className="text-pink-500" size={20} />
        <span className="text-white">{memory.likeCounter} likes</span>
      </div>

      <div className="px-4 pb-4">
        <p className="text-gray-300">{memory.description}</p>
        <p className="text-gray-400 text-sm mt-2">{memory.Location.name}</p>
      </div>
    </div>
  );
}

export default MemoryList;