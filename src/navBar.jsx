import React, { useState, useEffect } from 'react';
import { useUser } from './context/userContext';
import ProfileModal from './Components/Profile';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import api from './axiosConfig';
import Memory from './Components/Memory';
// Notification Dropdown Component
const NotificationDropdown = ({ isOpen, onClose }) => {
  const { notifications,user, markNotificationAsRead, markAllNotificationsAsRead,disableMap,enableMap,setIsAnyModalOpen } = useUser();
  const [notis,setNotis]=useState(notifications)
  const [gotomem,setGotomem]=useState()
  const [isModalOpen,setIsModalOpen]=useState(false)
  const [hlcmt,setHlcmt]=useState()
  useEffect(() => {
    const fetchInteractor = async (interactorId) => {
      try {
        const response = await api.get(`/user/${interactorId}`);
        return response.data.username;
      } catch (err) {
        console.error(err);
        return null; // Handle error gracefully
      }
    };
    
    const fetchMemforCom = async (sourceid) => {
      try {
        const response = await api.get(`/comment/memory/${sourceid}`);
        return response.data.data.memory.title;
      } catch (err) {
        console.error(err);
        return null; // Handle error gracefully
      }
    };
    const fetchMemIdC = async (sourceid) => {
      try {
        const response = await api.get(`/comment/memory/${sourceid}`);
        return response.data.data.memory.id;
      } catch (err) {
        console.error(err);
        return null; // Handle error gracefully
      }
    };
    const fetchMemIdL = async (sourceid) => {
      try {
        const response = await api.get(`/like/memory/${sourceid}`);
        return response.data.data.id;
      } catch (err) {
        console.error(err);
        return null; // Handle error gracefully
      }
    };
    const fetchMemforLike = async (sourceid) => {
      try {
        const response = await api.get(`/like/memory/${sourceid}`);

        return response.data.data.title;
      } catch (err) {
        console.error(err);
        return null; // Handle error gracefully
      }
    };
    const fetchNotifications = async () => {
      try {
        const updatedNotifications = await Promise.all(
          notifications.map(async (item) => {
            const username = await fetchInteractor(item.interactor_id);
            var memorycomment=null;
            var memoryid=null;
            if (item.type==='COMMENT'){

              memorycomment=await fetchMemforCom(item.source_id)
              memoryid=await fetchMemIdC(item.source_id)
            }
            if (item.type==='LIKE'){

              memorycomment=await fetchMemforLike(item.source_id)
              memoryid=await fetchMemIdL(item.source_id)
            }
            return {
              ...item,
              interactor: username,
              memcom:memorycomment,
              memorid:memoryid
            };
          })
        );
        // If this is part of state:
        setNotis(updatedNotifications);
      } catch (err) {
        console.error(err);
      }
    };
  
    fetchNotifications();
  }, [notifications]);
  return (
    <div className={`absolute right-0 mt-2 w-96 bg-[#2a102b] rounded-md shadow-lg max-h-96 overflow-y-auto z-[9999] ${!isOpen && 'hidden'}`}>
      <div className="flex justify-between items-center p-4 border-b border-[#3c173d]">
        <h3 className="text-lg font-semibold">Notifications</h3>
        <button
          onClick={markAllNotificationsAsRead}
          className="text-sm text-pink-400 hover:text-pink-600"
        >
          Mark all as read
        </button>
      </div>
      <div className="divide-y divide-[#3c173d]">
        {notis.length === 0 ? (
          <div className="p-4 text-center text-gray-400">
            No notifications
          </div>
        ) : (
          notis.map((notification) => (
            <div
              key={notification.id}
              onClick={() => {
                
                markNotificationAsRead(notification.id)
                
              }}
              className={`p-4 hover:bg-[#3c173d] cursor-pointer ${
                !notification.isRead ? 'bg-[#3c173d56]' : ''
              }`}
            >
              <div onClick={()=>{
                if (notification.type==='COMMENT'){
                  setHlcmt(notification.source_id)
                  setIsModalOpen(true)
                  setGotomem(notification.memorid)

                }
                if(notification.type==='LIKE'){
                  setIsModalOpen(true)
                  setGotomem(notification.memorid)
                }
              }} className="text-sm">{notification.interactor}{notification.type==='COMMENT'?" Commented On your Memory:":notification.type==='LIKE'?" Liked your Memory:":" Followed you"}{notification.type==='NEW_FOLLOWER'?"":" "+notification.memcom}</div>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(notification.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
      <Memory 
           isOpen={isModalOpen}
           onModalOpen={disableMap}
           onModalClose={enableMap}        
           hlcmt={hlcmt}    
           onClose={() => {
            setIsAnyModalOpen(false)
            setIsModalOpen(false)}}
           memoryId={gotomem}
        />
    </div>
  );
};

function Navbar() {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [profileId, setProfileId] = useState();
  const [showResults, setShowResults] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { memid, setIsAnyModalOpen, unreadCount } = useUser();
  const navigate = useNavigate();
  const { disableMap, enableMap } = useUser();

  const { user ,updateUser} = useUser();
  const [ProfileModale, setprofileModale] = useState(false);
  const { updateMemoriesShowcase } = useUser();

  const Logout = async () => {
    try {
      const token = JSON.parse(localStorage.getItem('tokens')).refreshToken.trim();
      console.log(token)
      const response = await api.post('/auth/logout', {
        refreshToken:token
      });
      if (response.data.message) {
        updateUser('', null, null);
        localStorage.clear();
        navigate("/");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (ProfileModale) {
      disableMap();
    } else {
      enableMap();
    }
  }, [ProfileModale, disableMap, enableMap]);
  
  const handleInputChange = async (e) => {
    const value = e.target.value;
    setSearchInput(value);

    if (value.length > 0) {
      try {
        const response = await api.get(`/user/search/${value}`);
        setSearchResults(response.data.data);
        setShowResults(true);
      } catch (error) {
        console.error('Error searching:', error);
      }
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleClickOutside = () => {
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  // Close notifications when clicking outside
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (!e.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  return (
    <div className="flex flex-row justify-between items-center py-2 px-4 gap-2 bg-[#16081a] text-white">
      <div>
        <img className='w-16 h-12' src="./logo.png" alt="Logo" />
      </div>

      <div className="relative">
        <input
          type="text"
          value={searchInput}
          onChange={handleInputChange}
          onBlur={handleClickOutside}
          className="bg-[#2a102b] rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-600 h-10 w-96 px-2"
          placeholder="Search..."
        />
        <i className="fa-solid fa-magnifying-glass"></i>

        {showResults && searchResults.length > 0 && (
          <div className="absolute w-full mt-1 bg-[#2a102b] rounded-md shadow-lg max-h-60 overflow-y-auto z-[9999]">
            {searchResults.map((result) => (
              <div
                key={result.id}
                onClick={() => {
                  setProfileId(result.id);
                  updateMemoriesShowcase(result.id);
                  setIsAnyModalOpen(true);
                  setprofileModale(true);
                }}
                className="px-4 py-2 hover:bg-[#3c173d] cursor-pointer text-white"
              >
                {result.username}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-row gap-3 items-center">
        {/* Notification Bell */}
        <div className="relative notification-container">
         {user.id? (<Bell
            onClick={(e) => {
              e.stopPropagation();
              setShowNotifications(!showNotifications);
            }}
            className="relative p-2 hover:bg-[#3c173d56] h-full w-full rounded-full"
          >
            <i className="fa-solid fa-bell text-xl"></i>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Bell>):(<></>)}
          <NotificationDropdown
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
          />
        </div>

        <div
          onClick={() => {
            
            console.log(user.id)
            setProfileId(user.id);
            updateMemoriesShowcase(user.id);
            setprofileModale(true);
          }}
          className="first-letter:uppercase font-semibold hover:text-pink-600 cursor-pointer py-1 px-2 rounded-md hover:bg-[#3c173d56]"
        >
          {user.name}
        </div>
        {user.id ? (
          <div
            onClick={() => Logout()}
            className="first-letter:uppercase font-semibold hover:text-pink-600 cursor-pointer py-1 px-2 rounded-md hover:bg-[#3c173d56]"
          >
            Logout
          </div>
        ) : (
          <></>
        )}
      </div>

      <ProfileModal
        isOpen={ProfileModale}
        userId={profileId}
        onClose={() => {
          setIsAnyModalOpen(false);
          setprofileModale(false);
        }}
      />
    </div>
  );
}

export default Navbar;