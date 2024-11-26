import React, { useEffect, useState } from 'react';
import { useUser } from '../context/userContext';
import api from "./../axiosConfig"
import { Pen, Upload,FlagIcon,Plus,Trash2 } from 'lucide-react';
import MemoryCarousel from "./MemoryCarousel"
import Report from './Report';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import AlbumMemoriesModal from './AlbumMemoriesModal';
import AlbumModal from "./Album"
const ProfileModal = ({ isOpen, onClose, userId }) => {
  const [profileData, setProfileData] = useState(null);
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { memid } = useUser()
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [isDeletingAlbum, setIsDeletingAlbum] = useState(false);
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [isEditingAlbum, setIsEditingAlbum] = useState(false);
const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);
const [albumToDelete, setAlbumToDelete] = useState(null);
const [deletingAlbumIds, setDeletingAlbumIds] = useState(new Set());
const [editingAlbum, setEditingAlbum] = useState(null);
  const { user } = useUser();
  const [followstatus,setFollowStatus]=useState("Follow");
  const [editing, setEditing] = useState(null);
  const [reportModalOpen,setReportModalOpen]=useState(false)
  const [editData, setEditData] = useState({});
  const [uploadType, setUploadType] = useState(null);
  const [userData, setUserData] = useState(null);
  const fetchAlbums = async () => {
    if (userId!==null && userId!==undefined){
    try {
      const response = await api.get(`/album/all/${userId}`);
      if (response.data.success) {
        setAlbums(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
}};
  const handleDeleteClick = (album) => {
    setAlbumToDelete(album);
  };
  
  const handleDeleteConfirm = async () => {
    if (!albumToDelete) return;
    const albumId = albumToDelete.id;
    
    try {
      setDeletingAlbumIds(prev => new Set([...prev]).add(albumId));
      const response = await api.delete(`/album/${albumId}`);
      
      if (response.data.success) {
        fetchAlbums() // Immediately update UI
        setAlbumToDelete(null); // Close modal
      }
    } catch (error) {
      console.error('Error deleting album:', error);
    } finally {
      setDeletingAlbumIds(prev => {
        const next = new Set(prev);
        next.delete(albumId);
        return next;
      });
    }
  };
  const handleCreateAlbum = async (formData) => {
    try {
      setIsCreatingAlbum(true);
      const response = await api.post(`/album/${userId}`, formData);
      if (response.data.success) {
        await fetchAlbums();
        setIsAlbumModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating album:', error);
    } finally {
      setIsCreatingAlbum(false);
    }
  };
  
  // Update edit handler:
  const handleUpdateAlbum = async (formData) => {
    try {
      setIsEditingAlbum(true);
      const response = await api.put(`/album/${editingAlbum.id}`, formData);
      if (response.data.success) {
        await fetchAlbums();
        setEditingAlbum(null);
      }
    } catch (error) {
      console.error('Error updating album:', error);
    } finally {
      setIsEditingAlbum(false);
    }
  };
  const handleDeleteAlbum = async (albumId) => {
    try {
      if (isDeletingAlbum) return; // Prevent multiple clicks
      
      setIsDeletingAlbum(true);
      
      if (window.confirm('Are you sure you want to delete this album?')) {
        const response = await api.delete(`/album/${albumId}`);
        if (response.data.success) {
          await fetchAlbums();
        }
      }
    } catch (error) {
      console.error('Error deleting album:', error);
    } finally {
      setIsDeletingAlbum(false);
    }
  };
  // Add this function if you need to view a single album's details
  const fetchSingleAlbum = async (albumId) => {
    try {
      const response = await api.get(`/album/single/${albumId}`);
      if (response.data.success) {
        return response.data.data;
      }
    } catch (error) {
      console.error('Error fetching album details:', error);
    }
  };
  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append(type, file);

    try {
      const response = await api.post(
        `/upload/single/${type}/profile/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.status === 200) {
        fetchUserData();
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const fetchmemdata = async () => {
    if (memid) {
      try {
        const response = await api.get(`/memory/user/${memid}`);
        if (response.status == 200) {
          setMemories(response.data)
        }
      }
      catch (err) {
        console.error(err)
      }
    }
  }

  const fetchUserData = async () => {
    if (!userId || !isOpen) return;

    try {
      const response = await api.get(`/profile/${userId}`);
      const data = response.data;
      if (data.success) {
        const userData = data.user;
        setUserData(userData);
        setProfileData([
          { label: 'Username', value: userData.username },
          { label: 'First Name', value: userData.Profile.firstName },
          { label: 'Last Name', value: userData.Profile.lastName },
          { label: 'Bio', value: userData.Profile.bio },
          { label: 'Address', value: userData.Profile.address },
          { label: 'Gender', value: userData.Profile.gender },
          { label: 'Birthday', value: userData.Profile.birthday }
        ]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
  const FollowUser=async()=>{
    try{
        const response=await api.post(`/follower/${user.id}/${userId}`)
        if (response.status===201){
          setFollowStatus("Following")
        }
    }catch(error){
      console.error(error)
    }
  }
  useEffect(() => {
    if (memid ) {  // Add these conditions
      fetchUserData();
      fetchmemdata();
      fetchAlbums();
    }
  }, [memid,isOpen]); 

  const handleEdit = async (field) => {
    if (editing === field) {
      try {
        const payload = {
          firstName: editData.firstname,
          lastName: editData.lastname,
          bio: editData.bio,
          address: editData.address,
          gender: editData.gender,
          birthday: editData.birthday
        };

        await api.put(`/profile/${userId}`, payload);
        fetchUserData();
        setEditing(null);
      } catch (error) {
        console.error('Error:', error);
      }
    } else {
      setEditing(field);
      setEditData({
        ...editData,
        [field]: profileData?.find(item =>
          item.label.toLowerCase().replace(' ', '') === field)?.value
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[19999]">
      <div className="bg-[#1F1625] w-full max-w-3xl h-[90vh] rounded-lg shadow-2xl relative overflow-hidden">
        <div onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl cursor-pointer z-[60]">
          ×
        </div>

        <div className="h-full flex flex-col overflow-hidden">
          <div className="relative w-full" style={{ height: "200px" }}>
            <div
              className="absolute inset-0 bg-cover bg-center brightness-50"
              style={{
                backgroundImage: `url(http://localhost:5000/${userData?.Profile?.wallImage || 'default-wall-image.jpg'})`
              }}
            />
            {user.id == userId ? (
              <label className="absolute top-2 z-[50] right-2 cursor-pointer bg-[#1F1625] p-2 rounded-full mt-12 hover:bg-[#2A1F33]">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e, 'wallImage')}
                />
                <Upload className="text-white hover:text-pink-500" size={20} />
              </label>
              
            ) : (
              <></>
            )}

            <div className="relative z-10 flex items-end p-4 h-full">
              <div className="relative">
                <img
                  src={`http://localhost:5000/${userData?.Profile?.avatarImage || "/logo.png"}`}
                  alt="Profile"
                  className="w-24 h-24 -mb-20 rounded-full object-cover border-4 border-white"
                />
                {user.id == userId ? (
                  <label className="absolute bottom-[-10px] right-[-10px] cursor-pointer bg-[#1F1625] z-[50] p-1.5 rounded-full hover:bg-[#2A1F33]">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, 'avatarImage')}
                    />
                    <Upload className="text-white hover:text-pink-500" size={16} />
                  </label>
                ) : (
                  <></>
                )}
              </div>
              
              <h1 className="ml-4 text-3xl -mb-14 font-bold text-white">
                {profileData?.[0]?.value}

                {userId!==user.id?(                <button
                onClick={()=>{FollowUser()}}
      className="ml-8 mt-4 px-6 py-3 bg-[#1F1625] hover:border-2 border-pink-300 text-white font-semibold text-lg rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-transform duration-200 ease-in-out"
    >
{followstatus}   </button>):(<></>)}

              </h1>

              <div className='ml-auto'>
             <FlagIcon onClick={() => setReportModalOpen(true)} color='white' className="cursor-pointer hover:text-gray-300" />

           </div>
           
            </div>

          </div>

          <div className="flex-1 p-6 overflow-y-auto scrollbar-hide">
            
            <div className="flex flex-row mt-20 gap-6">
              
              <div
                className="w-1/2 aspect-square max-w-[45vmin] max-h-[80vmin] rounded-lg bg-cover bg-center border-4 border-[#2A1F33]"
                style={{
                  backgroundImage: `url(http://localhost:5000/${userData?.Profile?.wallImage || 'default-profile-image.jpg'})`
                }}
              />
              <div className="flex-1">
                <div className="bg-[#2A1F33] p-4 rounded-lg">
                  <ul className="text-white space-y-3">
                    {profileData?.map((item, index) => {
                      const field = item.label.toLowerCase().replace(' ', '');
                      const maxDate = new Date();
                      maxDate.setFullYear(maxDate.getFullYear() - 80);
                      const today = new Date();

                      return (
                        <li key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="font-semibold">{item.label}:</span>{' '}
                            {editing === field ? (
                              field === 'birthday' ? (
                                <input
                                  type="date"
                                  value={editData[field] || ''}
                                  min={maxDate.toISOString().split('T')[0]}
                                  max={today.toISOString().split('T')[0]}
                                  onChange={(e) => setEditData({
                                    ...editData,
                                    [field]: e.target.value
                                  })}
                                  className="bg-[#1F1625] text-white px-2 py-1 rounded"
                                />
                              ) : field === 'gender' ? (
                                <select
                                  value={editData[field] || ''}
                                  onChange={(e) => setEditData({
                                    ...editData,
                                    [field]: e.target.value
                                  })}
                                  className="bg-[#1F1625] text-white px-2 py-1 rounded"
                                >
                                  <option value="">Select gender</option>
                                  <option value="Male">Male</option>
                                  <option value="Female">Female</option>
                                </select>
                              ) : field === 'username' ? (
                                <span className="text-gray-400">{item.value}</span>
                              ) : field === 'bio' ? (
                                <textarea
                                  value={editData[field] || ''}
                                  onChange={(e) => setEditData({
                                    ...editData,
                                    [field]: e.target.value
                                  })}
                                  className="bg-[#1F1625] text-white px-2 py-1 rounded w-full"
                                  rows={3}
                                />
                              ) : (
                                <input
                                  type="text"
                                  value={editData[field] || ''}
                                  onChange={(e) => setEditData({
                                    ...editData,
                                    [field]: e.target.value
                                  })}
                                  className="bg-[#1F1625] text-white px-2 py-1 rounded"
                                />
                              )
                            ) : (
                              item.value || 'Not set'
                            )}
                          </div>
                          {field !== 'username' && user.id == userId && (
                            <Pen
                              className="cursor-pointer hover:text-pink-500 ml-2"
                              size={16}
                              onClick={() => handleEdit(field)}
                            />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
            <div>
            <div className="text-2xl font-bold text-white mt-8 mb-4">
 {user.id === userId ? 'Your Memories' : `${profileData?.[0]?.value}'s Memories`}
</div>  

<MemoryCarousel memories={memories} onMemoryDeleted={fetchmemdata} />
              <div className="mt-8">
  <div className="flex justify-between items-center mb-4">
    <h2 className="text-2xl font-bold text-white">Albums</h2>
    {user.id === userId && (
      <button
        onClick={() => setIsAlbumModalOpen(true)}
        className="bg-[#2A1F33] hover:bg-[#3A2F43] text-white p-2 rounded-full transition-colors"
      >
        <Plus size={24} />
      </button>
    )}
  </div>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {albums.map((album) => (
  <div 
    key={album.id} 
    className="bg-[#2A1F33] p-4 rounded-lg"
  >
    <div className="flex justify-between items-start mb-2">
      <h3 
        className="text-lg font-semibold text-white cursor-pointer hover:text-pink-500"
        onClick={() => setSelectedAlbum(album)}
      >
        {album.title}</h3>
          {user.id === userId && (
            <div className="flex space-x-2">
              <Pen
                className="cursor-pointer text-gray-400 hover:text-white"
                size={16}
                onClick={() => setEditingAlbum(album)}
              />
<Trash2
  className={`cursor-pointer ${
    deletingAlbumIds.has(album.id) 
      ? 'text-gray-500 cursor-not-allowed' 
      : 'text-gray-400 hover:text-red-500'
  }`}
  size={16}
  onClick={() => !deletingAlbumIds.has(album.id) && handleDeleteClick(album)}
/>
            </div>
          )}
        </div>
        <p className="text-gray-400 text-sm">{album.description}</p>
      </div>
    ))}
  </div>

  <AlbumModal
  isOpen={isAlbumModalOpen}
  onClose={() => setIsAlbumModalOpen(false)}
  onSubmit={handleCreateAlbum}
  isLoading={isCreatingAlbum}
/>
<AlbumMemoriesModal 
  isOpen={!!selectedAlbum}
  onClose={() => setSelectedAlbum(null)}
  albumId={selectedAlbum?.id}
  albumTitle={selectedAlbum?.title}
/>
<AlbumModal
  isOpen={!!editingAlbum}
  onClose={() => setEditingAlbum(null)}
  onSubmit={handleUpdateAlbum}
  initialData={editingAlbum}
  isLoading={isEditingAlbum}
/>
</div>
            </div>
          </div>
        </div>
      </div>
      <Report 
       isOpen={reportModalOpen}
       onClose={() => setReportModalOpen(false)}
       memoryId={userId}
       memoryTitle={profileData?.[0]?.value}
       reportType="PERSON"
     />
     {/* Add this just before the final closing div of your ProfileModal */}
<DeleteConfirmationModal
  isOpen={!!albumToDelete}
  onClose={() => setAlbumToDelete(null)}
  onConfirm={handleDeleteConfirm}
  albumTitle={albumToDelete?.title}
/>
    </div>
  );
}

export default ProfileModal;