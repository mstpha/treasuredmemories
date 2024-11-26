import React, { useState, useEffect } from 'react';
import { Users, Flag, Search, Ban, Trash2, User, Eye } from 'lucide-react';
import api from './../axiosConfig';
import Memory from '../Components/Memory';
import ProfileModal from '../Components/Profile';
const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedMemoryId, setSelectedMemoryId] = useState(null);
  const [selectedProfileId, setSelectedProfileId] = useState(null);
  const [highlightedCommentId, setHighlightedCommentId] = useState(null);
  
  // Add these handler functions:
  const handleViewMemory = (memoryId, commentId = null) => {
    setSelectedMemoryId(memoryId);
    setHighlightedCommentId(commentId);
    setIsMemoryModalOpen(true);
  };
  
  const handleViewProfile = (userId) => {
    setSelectedProfileId(userId);
    setIsProfileModalOpen(true);
  };


  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/report/all');
      
      // Fetch detailed information for each report
      const reportsWithDetails = await Promise.all(
        response.data.data.map(async (report) => {
          try {
            // Get reporter info
            const reporterResponse = await api.get(`/user/${report.author_id}`);
            const reporterUsername = reporterResponse.data.username;
  
            let sourceDetails = {};
            
            // Handle different report types
            switch (report.reportType) {
                case 'COMMENT':
    try {
        console.log("Starting COMMENT case for report:", report);
        
        // Get comment info
        console.log("Fetching comment with ID:", report.source_id);
        const commentResponse = await api.get(`/comment/specific/${report.source_id}`);
        console.log("Comment API Response:", commentResponse);
        console.log("Comment Data:", commentResponse.data);
        const comment = commentResponse.data.data.comment; // Extract comment from response
        
        // Get memory the comment is on
        console.log("Fetching memory for comment:", report.source_id);
        const memoryResponse = await api.get(`/comment/memory/${report.source_id}`);
        console.log("Memory API Response:", memoryResponse);
        console.log("Memory Data:", memoryResponse.data);
        const memory = memoryResponse.data.data.memory; // Extract memory from response
        
        // Get comment author info
        const commentAuthorResponse = await api.get(`/user/${comment.user_id}`);
        console.log("Comment Author Response:", commentAuthorResponse);
        console.log("Comment Author Data:", commentAuthorResponse.data);
        
        sourceDetails = {
            type: 'COMMENT',
            comment: comment.content,
            commentAuthor: {
                username: commentAuthorResponse.data.username,
                id: comment.user_id
            },
            memory: memory.title,
            memoryId: memory.id
        };
        console.log("Created sourceDetails for comment:", sourceDetails);
    } catch (error) {
        console.error("Error in COMMENT case - Full error:", error);
        console.error("Error response data:", error.response?.data);
        console.error("Error status:", error.response?.status);
        sourceDetails = {
            type: 'COMMENT',
            comment: 'Error loading comment',
            commentAuthor: { username: 'Unknown', id: null },
            memory: 'Error loading memory',
            memoryId: null
        };
    }
    break;
                case 'MEMORY':
                    try {
                      console.log("Starting MEMORY case for report:", report);
                      
                      // Get memory info
                      const targetMemoryResponse = await api.get(`/memory/${report.source_id}`);

                      
                      const targetMemory = targetMemoryResponse.data;

                      // Get user info using the memory's user_id
                      const userResponse = await api.get(`/user/${targetMemory.user_id}`);

                      sourceDetails = {
                        type: 'MEMORY',
                        memory: targetMemory.title,
                        memoryId: targetMemory.id,
                        memoryAuthor: {
                          username: userResponse.data.username,
                          id: targetMemory.user_id
                        }
                      };
                      console.log("Created sourceDetails:", sourceDetails);
                  
                    } catch (error) {
                      console.error("Error in MEMORY case - Full error:", error);
                      console.error("Error response data:", error.response?.data);
                      console.error("Error status:", error.response?.status);
                      sourceDetails = {
                        type: 'MEMORY',
                        memory: 'Error loading memory',
                        memoryId: report.source_id,
                        memoryAuthor: 'Unknown'
                      };
                    }
                    break;
              case 'PERSON':
                // Get reported user info
                const userResponse = await api.get(`/user/${report.source_id}`);
                
                sourceDetails = {
                  type: 'PERSON',
                  user: userResponse.data.username,
                  userId: report.source_id
                };
                break;
            }
  
            return {
              ...report,
              reporter: reporterUsername,
              details: sourceDetails
            };
  
          } catch (error) {
            console.error(`Error fetching details for report ${report.id}:`, error);
            return {
              ...report,
              reporter: 'Unknown User',
              details: { type: 'UNKNOWN' }
            };
          }
        })
      );
      
      setReports(reportsWithDetails);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (activeTab === 'reports') {
      fetchReports();
    }
  }, [activeTab]);
  const handleDeleteMemory = async (memoryId, reportId) => {
    if (window.confirm('Are you sure you want to delete this memory?')) {
      try {
        await api.delete(`/memory/${memoryId}`);
        // Delete the report after successfully deleting the memory
        await api.delete(`/report/${reportId}`);
        fetchReports();
      } catch (error) {
        console.error('Error deleting memory:', error);
      }
    }
  };
  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await api.delete(`/report/${reportId}`);
        fetchReports();
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
  };
  const handleBanUser = async (userId) => {
    try {
      await api.delete(`/user/${userId}`);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userId));

      setShowBanModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };
  const [showResults, setShowResults] = useState(false);

  const handleDeleteComment = async (commentId, reportId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      try {
        await api.delete(`/comment/${commentId}`);
        // Delete the report after successfully deleting the comment
        await api.delete(`/report/${reportId}`);
        fetchReports();
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    }
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  
    if (value.length > 0) {
      try {
        const response = await api.get(`/user/search/${value}/5`);
        setUsers(response.data.data);
      } catch{
      }
    } 
  };
  return (
    <div className="min-h-screen bg-[#1F1625] text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#2A1F33] p-6 space-y-8">
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="Logo" className="w-8 h-8" />
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
              activeTab === 'users'
                ? 'bg-pink-600 text-white'
                : 'text-gray-300 hover:bg-[#3c2d47] hover:text-white'
            }`}
          >
            <Users size={20} />
            Users
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
              activeTab === 'reports'
                ? 'bg-pink-600 text-white'
                : 'text-gray-300 hover:bg-[#3c2d47] hover:text-white'
            }`}
          >
            <Flag size={20} />
            Reports
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'users' ? (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Users</h2>
              <div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
  <input
    type="text"
    placeholder="Search users..."
    value={searchTerm}
    onChange={handleSearchChange}
    className="pl-10 pr-4 py-2 bg-[#2A1F33] rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
  />
</div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-pink-500"></div>
              </div>
            ) : (
              <div className="bg-[#2A1F33] rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#3c2d47]">
                      <th className="px-6 py-4 text-left">Username</th>
                      <th className="px-6 py-4 text-left">Email</th>
                      <th className="px-6 py-4 text-left">Joined Date</th>
                      <th className="px-6 py-4 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3c2d47]">
  {users.map((user) => (
    <tr key={user.id} className="hover:bg-[#3c2d47]">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <img
            src={`http://localhost:5000/${user.Profile?.avatarImage || 'default-profile-image.jpg'}`}
            alt={user.username}
            className="w-8 h-8 rounded-full object-cover"
          />
          {user.username}
        </div>
      </td>
      <td className="px-6 py-4 text-gray-300">{user.email}</td>
      <td className="px-6 py-4 text-gray-300">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="px-6 py-4">
        <button
          onClick={() => {
            setSelectedUser(user);
            setShowBanModal(true);
          }}
          className="text-red-500 hover:text-red-400 flex items-center gap-2"
        >
          <Ban size={16} />
          Ban
        </button>
      </td>
    </tr>
  ))}
</tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
            <div className="space-y-6 h-screen overflow-y-auto pb-8">
              <h2 className="text-2xl font-bold">Reports</h2>
  
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-pink-500"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="bg-[#2A1F33] p-6 rounded-lg">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-gray-400">Reported by</span>
                          <span className="ml-2 text-white">{report.reporter}</span>
                        </div>
                        <div className="flex gap-2">
                          {report.reportType === 'COMMENT' ? (
                            <>
                              <button
                                onClick={() => handleViewMemory(report.details.memoryId, report.source_id)}
                                className="text-pink-500 hover:text-pink-400 flex items-center gap-2"
                              >
                                <Eye size={16} />
                                View Comment
                              </button>
                              <button
                                onClick={() => handleViewProfile(report.details.commentAuthor.id)}
                                className="text-pink-500 hover:text-pink-400 flex items-center gap-2"
                              >
                                <User size={16} />
                                View User
                              </button>
                              <button
                                onClick={() => handleDeleteComment(report.source_id,report.id)}
                                className="text-red-500 hover:text-red-400 flex items-center gap-2"
                              >
                                <Trash2 size={16} />
                                Delete Comment
                              </button>
                            </>
                          ) : report.reportType === 'MEMORY' ? (
                            <>
                              <button
                                onClick={() => handleViewMemory(report.source_id)}
                                className="text-pink-500 hover:text-pink-400 flex items-center gap-2"
                              >
                                <Eye size={16} />
                                View Memory
                              </button>
                              <button
                                onClick={() => handleViewProfile(report.details.memoryAuthor.id)}
                                className="text-pink-500 hover:text-pink-400 flex items-center gap-2"
                              >
                                <User size={16} />
                                View User
                              </button>
                              <button
                                onClick={() => handleDeleteMemory(report.source_id)}
                                className="text-red-500 hover:text-red-400 flex items-center gap-2"
                              >
                                <Trash2 size={16} />
                                Delete Memory
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleViewProfile(report.source_id)}
                              className="text-pink-500 hover:text-pink-400 flex items-center gap-2"
                            >
                              <User size={16} />
                              View User
                            </button>
                          )}
                          <button
  onClick={() => handleDeleteReport(report.id)}
  className="text-red-500 hover:text-red-400 flex items-center gap-2"
>
  <Trash2 size={16} />
  Delete Report
</button>
                        </div>
                      </div>
  
                      <div className="bg-[#3c2d47] p-4 rounded-lg mb-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-semibold text-white">Report Type:</h4>
                          <span className="text-sm text-pink-500">{report.reason}</span>
                        </div>
                        {report.reportType === 'COMMENT' && (
                          <p className="text-gray-300">
                            User <span className="text-white">{report.details.commentAuthor.username}</span> commented: 
                            "<span className="text-white">{report.details.comment}</span>" 
                            on memory: <span className="text-white">{report.details.memory}</span>
                          </p>
                        )}
                        {report.reportType === 'MEMORY' && (
                          <p className="text-gray-300">
                            User <span className="text-white">{report.details.memoryAuthor.username}</span>'s memory: 
                            "<span className="text-white">{report.details.memory}</span>"
                          </p>
                        )}
                        {report.reportType === 'PERSON' && (
                          <p className="text-gray-300">
                            User <span className="text-white">{report.details.user}</span>'s profile was reported
                          </p>
                        )}
                      </div>
  
                      <div className="bg-[#1F1625] p-4 rounded-lg">
                        <h4 className="text-sm text-gray-400 mb-2">Report Description:</h4>
                        <p className="text-white">{report.description}</p>
                      </div>
  
                      <div className="mt-4 text-sm text-gray-400">
                        Reported on {new Date(report.createdAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
  
        {/* Ban Confirmation Modal */}
        {showBanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-[#2A1F33] p-6 rounded-lg max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Ban User</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to ban {selectedUser?.username}? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setShowBanModal(false);
                    setSelectedUser(null);
                  }}
                  className="px-4 py-2 text-gray-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBanUser(selectedUser?.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Ban User
                </button>
              </div>
            </div>
          </div>
        )}
  
        <Memory 
          isOpen={isMemoryModalOpen}
          onClose={() => setIsMemoryModalOpen(false)}
          memoryId={selectedMemoryId}
          hlcmt={highlightedCommentId}
        />
  
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          userId={selectedProfileId}
        />
      </div>
    );
}
export default Dashboard;