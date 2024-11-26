import React, { useEffect, useState } from 'react';
import { FlagIcon, Heart, Pen, Upload, X, Plus, Trash2 } from 'lucide-react';
import api from "./../axiosConfig"
import Report from "./Report";
import { useUser } from '../context/userContext';
import LinkMemoryAlbumModal from './LinkMemToAlbum';
function Memory({ isOpen, onClose, memoryId,hlcmt,onMemoryDeleted }) {
const [memory, setMemory] = useState(null);
const [currentImageIndex, setCurrentImageIndex] = useState(0);
const [isLiked, setIsLiked] = useState(false);
const [localLikeCount, setLocalLikeCount] = useState(0);
const { user,memid } = useUser();
const [reportModalOpen, setReportModalOpen] = useState(false);
const [reportingComment, setReportingComment] = useState(null);
const [loading, setLoading] = useState(true);
const [comment, setComment] = useState('');
const [linkAlbumModalOpen, setLinkAlbumModalOpen] = useState(false);
const [editingComment, setEditingComment] = useState(null);
const [commentUsers, setCommentUsers] = useState({});
const [addingImage, setAddingImage] = useState(false);

const [isEditing, setIsEditing] = useState(false);
const [editData, setEditData] = useState({
  title: '',
  description: ''
});
// Add single image
const handleAddImage = async (e) => {
  try {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('images', file); // The name parameter matches your route

    await api.post(`/upload/multi/images/memory/${memoryId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    fetchMemory();
  } catch (error) {
    console.error('Error adding image:', error);
  }
};
// Replace image - sends full path as it is in the array
const handleReplaceImage = async (e, oldFilePath) => {
  try {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('newFile', file);
    // Send the full path as stored in the array
    formData.append('oldFilename', oldFilePath);

    await api.put(`/upload/specific/images/memory/${memoryId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    fetchMemory();
  } catch (error) {
    console.error('Error replacing image:', error);
  }
};

const handleDeleteMemory = async () => {
  try {
    await api.delete(`/memory/${memoryId}`);
    onMemoryDeleted()
    onClose();
  } catch (error) {
    console.error('Error deleting memory:', error);
  }
};

const handleDeleteComment = async (commentId) => {
  try {
    await api.delete(`/comment/${commentId}`);
    fetchMemory();
  } catch (error) {
    console.error('Error deleting comment:', error);
  }
};
// Delete image - sends full path as it is in the array
const handleDeleteImage = async (fullPath) => {
  try {
    // Send the full path as stored in the array
    await api.delete(`/upload/specific/images/memory/${memoryId}`, {
      data: { filename: fullPath }
    });
    
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
    
    fetchMemory();
  } catch (error) {
    console.error('Error deleting image:', error);
  }
};
const fetchMemory = async () => {
 try {
   const response = await api.get(`/memory/${memoryId}`);
   if (response.status === 200) {
     const memoryData = response.data;
     const commentsResponse = await api.get(`/comment/${memoryId}`);
     const comments = commentsResponse.data.data || [];
     
     // Set edit data
     setEditData({
       title: memoryData.title,
       description: memoryData.description
     });
     
     // Fetch user data for each comment
     const userDataPromises = comments.map(comment => 
       api.get(`/profile/${comment.user_id}`)
     );
     const userResponses = await Promise.all(userDataPromises);
     
     // Create a map of user_id to user data
     const userMap = {};
     userResponses.forEach(response => {
       const userData = response.data.user;
       userMap[userData.id] = userData;
     });
     const parseImages = (imagesString) => {
      try {
        if (!imagesString) return [];
        // First parse to handle the outer quotes
        const parsed = JSON.parse(imagesString);
        // If it's already an array, return it
        if (Array.isArray(parsed)) return parsed;
        // If it's a string (single image), parse it if needed and wrap in array
        return [parsed];
      } catch (error) {
        console.error('Error parsing images:', error);
        return [];
      }
    };
     setCommentUsers(userMap);
     setMemory({
      name: memoryData.title,
      description: memoryData.description,
      images: parseImages(memoryData.images),
      likes: memoryData.likeCounter,
      comments: comments,
      location: memoryData.Location,
      user_id: memoryData.user_id
    });
     setLocalLikeCount(memoryData.likeCounter);
   }
 } catch (error) {
   console.error('Error fetching memory:', error);
 } finally {
   setLoading(false);
 }
};

const handleEdit = async () => {
  try {
    await api.put(`/memory/${memoryId}`, editData);
    setIsEditing(false);
    fetchMemory();
  } catch (error) {
    console.error('Error updating memory:', error);
  }
};


useEffect(() => {
  const checkLikeStatus = async () => {
    try {
      if (memoryId && user?.id) {
        const response = await api.get(`/like/memory/${memoryId}/user/${user.id}`);
        setIsLiked(response.data.success);
      }
    } catch (err) {
      console.error("Error checking like status:", err);
    }
  };

  if (isOpen && memoryId) {
    fetchMemory();
    checkLikeStatus();
  }
}, [memoryId, isOpen, user?.id]);

const handleLike = async () => {
  try {
    if (isLiked) {
      await api.delete(`/like/${memoryId}`);
      setLocalLikeCount(prev => prev - 1);
    } else {
      await api.post(`/like/${memoryId}`);
      setLocalLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  } catch (err) {
    console.error("Error toggling like:", err);
  }
};

const handleAddComment = async () => {
  if (!comment.trim()) return;
  
  try {
    await api.post(`/comment/${memoryId}`, {
      content: comment
    });
    setComment('');
    fetchMemory();
  } catch (err) {
    console.error('Error adding comment:', err);
  }
};

const handleUpdateComment = async (commentId) => {
  try {
    await api.put(`/comment/${commentId}`, {
      content: editingComment.content
    });
    setEditingComment(null);
    fetchMemory();
  } catch (err) {
    console.error('Error updating comment:', err);
  }
};

const nextImage = () => {
  setCurrentImageIndex(prev => prev === memory.images.length - 1 ? 0 : prev + 1);
};

const prevImage = () => {
  setCurrentImageIndex(prev => prev === 0 ? memory.images.length - 1 : prev - 1);
};

if (!isOpen || !memory || loading) return null;

return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[19999]">
    <div className="bg-[#1F1625] w-full md:w-[40%] h-[60vh] rounded-lg shadow-2xl relative">
      
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl">×</button>
      <div className="h-full flex flex-col p-6 overflow-y-auto">
        <div className="flex justify-between items-center mb-2">
          {isEditing ? (
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              className="bg-[#2A1F33] text-white text-xl font-semibold p-2 rounded w-full mr-2"
            />
          ) : (
            <h2 className="text-white text-xl font-semibold">{memory.name}</h2>
          )}

          {memid === user.id && (
  <div className="flex gap-2">
    <button
      onClick={() => setLinkAlbumModalOpen(true)}
      className="text-pink-500 hover:text-pink-400"
      title="Add to Album"
    >
      <Plus size={16} />
    </button>
    <button
        onClick={handleDeleteMemory}
        className="text-red-500 hover:text-red-400"
        title="Delete Memory"
      >
        <Trash2 size={16} />
      </button>

    {isEditing ? (
      <>
        <button
          onClick={handleEdit}
          className="text-green-500 hover:text-green-400 text-sm"
        >
          Save
        </button>
        <button
          onClick={() => setIsEditing(false)}
          className="text-gray-400 hover:text-gray-300 text-sm"
        >
          Cancel
        </button>
      </>
    ) : (
      <button
        onClick={() => setIsEditing(true)}
        className="text-pink-500 hover:text-pink-400"
      >
        <Pen size={16} />
      </button>
    )}
  </div>
)}
        </div>

        <div className="relative w-full h-56 mb-4 flex-none">
          <img
            src={memory.images && memory.images[currentImageIndex] ? `http://localhost:5000/${memory.images[currentImageIndex]}` : "/logo.png"}
            alt={`Memory ${currentImageIndex + 1}`}
            className="w-full h-full object-fit rounded-lg"
          />
{memory.images && Array.isArray(memory.images) && memory.images.length > 1 && (
  <>
    <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full">←</button>
    
    <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full">→</button>
    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
      {Array.isArray(memory.images) && memory.images.map((_, index) => (
        <div 
          key={index} 
          className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-white' : 'bg-gray-400'}`} 
        />
      ))}
    </div>
  </>
)}  
          {memid === user.id && (
            <div className="absolute top-2 right-2 flex gap-2">

              <input
                type="file"
                id="add-new-image"
                className="hidden"
                accept="image/*"
                onChange={handleAddImage}
              />
              <label
                htmlFor="add-new-image"
                className="bg-green-500 hover:bg-green-600 text-white p-2 rounded cursor-pointer"
                title="Add new image"
              >
                <Upload size={16} />
              </label>

              {/* Replace Current Image */}
              <input
                type="file"
                id={`replace-image-${currentImageIndex}`}
                className="hidden"
                accept="image/*"
                onChange={(e) => handleReplaceImage(e, memory.images[currentImageIndex])}
              />
              <label
                htmlFor={`replace-image-${currentImageIndex}`}
                className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded cursor-pointer"
                title="Replace current image"
              >
                <Upload size={16} />
              </label>

              {/* Delete Image */}
                <button
                  onClick={() => handleDeleteImage(memory.images[currentImageIndex])}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded"
                  title="Delete current image"
                >
                  <X size={16} />
                </button>
              
            </div>
          )}
        </div>

        {isEditing ? (
          <textarea
            value={editData.description}
            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
            className="bg-[#2A1F33] text-white p-2 rounded mb-4 w-full"
            rows={3}
          />
        ) : (
          <p className="text-gray-300 mb-4">{memory.description}</p>
        )}

        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-700 w-full">
          <button onClick={handleLike} className="transition-colors duration-300">
            <Heart className={`${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} size={24} />
          </button>
          <span className="text-gray-400">{localLikeCount} likes</span>
          <div className='ml-auto'>
            <FlagIcon onClick={() => setReportModalOpen(true)} color='white' className="cursor-pointer hover:text-gray-300" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <h3 className="text-white text-lg mb-3">Comments</h3>
          <div className="space-y-4">
          {memory.comments
  .sort((a, b) => (a.id === hlcmt ? -1 : b.id === hlcmt ? 1 : 0)) // Sort to bring hlcmt to the top
  .map((comment) => {
                  const userData = commentUsers[comment.user_id];
              return (
                <div key={comment.id} className="bg-[#2A1F33] p-3 rounded-lg">
                  <div className="flex items-start gap-3">
                    <img
                      src={`http://localhost:5000/${userData?.Profile?.avatarImage || 'default-profile-image.jpg'}`}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-white font-semibold text-sm">
                          {userData?.username || 'Unknown User'}
                        </p>
                        <button 
                          onClick={() => setReportingComment(comment)}
                          className="text-gray-400 hover:text-gray-200"
                        >
                          <FlagIcon size={16} />
                          
                        </button>
                      </div>
                      
                      {editingComment?.id === comment.id ? (
                        <div className="mt-1">
                          <input
                            value={editingComment.content}
                            onChange={(e) => setEditingComment({...editingComment, content: e.target.value})}
                            className="bg-[#1F1625] text-white px-2 py-1 rounded w-full"
                          />
                          <button 
                            onClick={() => handleUpdateComment(comment.id)} 
                            className="text-pink-500 text-sm mt-2"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <p className="text-gray-300 text-sm mt-1">{comment.content}</p>
                      )}
{comment.user_id === user.id && (
  <div className="flex gap-2 mt-1">
    <button 
      onClick={() => setEditingComment(comment)}
      className="text-gray-400 text-sm hover:text-gray-200"
    >
      Edit
    </button>
    <button 
      onClick={() => handleDeleteComment(comment.id)}
      className="text-red-500 text-sm hover:text-red-400"
    >
      Delete
    </button>
  </div>
)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-2">
            <input
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-[#2A1F33] text-white p-2 rounded-lg"
            />
            <button 
              onClick={handleAddComment}
              className="px-4 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>

    <Report 
      isOpen={reportModalOpen}
      onClose={() => setReportModalOpen(false)}
      memoryId={memoryId}
      memoryTitle={memory.name}
      reportType="MEMORY"
    />

    {reportingComment && (
      <Report 
        isOpen={!!reportingComment}
        onClose={() => setReportingComment(null)}
        memoryId={reportingComment.id}
        memoryTitle={`Comment by ${commentUsers[reportingComment.user_id]?.username || 'Unknown User'}`}
        reportType="COMMENT"
      />
    )}
    {/* Add this just before the final closing div */}
<LinkMemoryAlbumModal 
  isOpen={linkAlbumModalOpen}
  onClose={() => setLinkAlbumModalOpen(false)}
  memoryId={memoryId}
  userId={user.id}
/>
  </div>
);
}

export default Memory;