import React from 'react';

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, albumTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[20001]">
      <div className="bg-[#1F1625] w-full max-w-md rounded-lg shadow-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Delete Album</h2>
        <p className="text-gray-300 mb-6">
          Are you sure you want to delete the album "{albumTitle}"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-4">
  <button
    onClick={onClose}
    className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
  >
    Cancel
  </button>
  <button
    onClick={(e) => {
      e.preventDefault();
      onConfirm();
    }}
    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
  >
    Delete
  </button>
</div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;