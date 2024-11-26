import React, { useState,useEffect } from 'react';
import { X } from 'lucide-react';

const AlbumModal = ({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) => {
    const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: initialData?.title || '',
        description: initialData?.description || ''
      });
    }
  }, [isOpen, initialData]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[20000]">
      <div className="bg-[#1F1625] w-full max-w-md rounded-lg shadow-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {initialData ? 'Edit Album' : 'Create New Album'}
          </h2>
          <X 
            className="text-gray-400 hover:text-white cursor-pointer" 
            onClick={onClose}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-white mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-[#2A1F33] text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600"
              required
            />
          </div>

          <div>
            <label className="block text-white mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#2A1F33] text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-600 min-h-[100px]"
              required
            />
          </div>

          <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-pink-600 text-white py-2 rounded-lg transition-colors ${
            isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-700'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
              </svg>
              {initialData ? 'Saving...' : 'Creating...'}
            </span>
          ) : (
            initialData ? 'Save Changes' : 'Create Album'
          )}
        </button>
        </form>
      </div>
    </div>
  );
};

export default AlbumModal;