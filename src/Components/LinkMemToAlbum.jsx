import React, { useEffect, useState } from 'react';
import { Plus, X, Check, Loader } from 'lucide-react';
import api from '../axiosConfig';

const LinkMemoryAlbumModal = ({ isOpen, onClose, memoryId, userId }) => {
  const [albums, setAlbums] = useState([]);
  const [linkedAlbums, setLinkedAlbums] = useState(new Set());

  const [loading, setLoading] = useState(true);
  // Change from Map to object for simpler state management
  const [linkingStates, setLinkingStates] = useState({});

  const fetchAlbums = async () => {
    try {
      const response = await api.get(`/album/all/${userId}`);
      if (response.data.success) {
        setAlbums(response.data.data);
        
        // Check which albums contain this memory
        const linkedAlbumsChecks = await Promise.all(
          response.data.data.map(album => checkMemoryInAlbum(album.id))
        );
        
        const linkedAlbumsSet = new Set(
          response.data.data
            .filter((_, index) => linkedAlbumsChecks[index])
            .map(album => album.id)
        );
        
        setLinkedAlbums(linkedAlbumsSet);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (isOpen) {
      fetchAlbums();
    }
  }, [isOpen]);
  const checkMemoryInAlbum = async (albumId) => {
    try {
      const response = await api.get(`/memory/${memoryId}/album/${albumId}`);
      return response.data.success;
    } catch (error) {
      return false;
    }
  };
  const handleLinkMemory = async (albumId) => {
    // Prevent multiple clicks
    if (linkingStates[albumId]) return;

    // Set linking state
    setLinkingStates(prev => ({
      ...prev,
      [albumId]: 'linking'
    }));

    try {
      const response = await api.post(`/memory/${memoryId}/album/${albumId}`);
      if (response.data.success) {
        // Show success state
        setLinkingStates(prev => ({
          ...prev,
          [albumId]: 'success'
        }));
        // Reset after 2 seconds
        setTimeout(() => {
          setLinkingStates(prev => {
            const newState = { ...prev };
            delete newState[albumId];
            return newState;
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error linking memory to album:', error);
      // Reset state on error
      setLinkingStates(prev => {
        const newState = { ...prev };
        delete newState[albumId];
        return newState;
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[20002]">
      <div className="bg-[#1F1625] w-full max-w-md rounded-lg shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Add to Album</h2>
          <X 
            className="text-gray-400 hover:text-white cursor-pointer" 
            onClick={onClose}
          />
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader className="animate-spin text-pink-500" size={24} />
          </div>
        ) : albums.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No albums found</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
{albums.map((album) => (
  <div 
    key={album.id}
    className="bg-[#2A1F33] p-4 rounded-lg flex justify-between items-center"
  >
    <div>
      <h3 className="text-white font-semibold">{album.title}</h3>
      <p className="text-gray-400 text-sm">{album.description}</p>
    </div>
    {linkedAlbums.has(album.id) ? (
      <div className="bg-green-500 p-2 rounded-full">
        <Check size={16} className="text-white" />
      </div>
    ) : (
      <button
        onClick={() => handleLinkMemory(album.id)}
        disabled={linkingStates[album.id]}
        className={`p-2 rounded-full transition-colors ${
          linkingStates[album.id] === 'success'
            ? 'bg-green-500'
            : 'bg-pink-600 hover:bg-pink-700'
        }`}
      >
        {linkingStates[album.id] === 'success' ? (
          <Check size={16} className="text-white" />
        ) : linkingStates[album.id] === 'linking' ? (
          <Loader size={16} className="text-white animate-spin" />
        ) : (
          <Plus size={16} className="text-white" />
        )}
      </button>
    )}
  </div>
))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LinkMemoryAlbumModal;