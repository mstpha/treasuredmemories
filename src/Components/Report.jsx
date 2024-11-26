import React, { useEffect, useState } from 'react';
import { FlagIcon } from 'lucide-react';
import api from './../axiosConfig';
import { useUser } from '../context/userContext';

const ReportReason = {
  ABUSIVE_CONTENT: "ABUSIVE_CONTENT",
  INAPPROPRIATE_CONTENT: "INAPPROPRIATE_CONTENT",
  MISLEADING_INFORMATION: "MISLEADING_INFORMATION",
  COPYRIGHT_VIOLATION: "COPYRIGHT_VIOLATION",
  OTHER: "OTHER",
};

function Report({ isOpen, onClose, memoryId, memoryTitle,reportType }) {
  const [description, setDescription] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const {user}=useUser()
  useEffect(()=>{
    console.log(reportType)
  },[])
  const handleSubmit = async () => {
    if (!description.trim() || !reason) return;
    
    setSubmitting(true);
    try {
      await api.post(`/report/${user.id}`, {
        source_id: memoryId,
        description: description,
        reason: reason,
        reportType: reportType === 'MEMORY' ? 'MEMORY' :reportType === 'COMMENT'? 'COMMENT':'PERSON'
      });
      onClose();
      setDescription('');
      setReason('');
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const formatReasonLabel = (reason) => {
    return reason
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-[#1F1625] w-full md:w-[25%] h-[50vh] rounded-lg shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-xl"
        >
          ×
        </button>

        <div className="h-full flex flex-col p-6 overflow-y-auto">
          <p className="text-white mb-4">
          Please specify the reason to report {reportType === 'MEMORY' ? 'Memory' :reportType === 'COMMENT'? 'Comment':'PERSON'}: 
          <span className="font-semibold">{` "${memoryTitle}"`}</span>
          </p>

          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="bg-[#2A1F33] text-white p-3 rounded-lg mb-4 border border-gray-700 focus:outline-none focus:border-purple-500"
          >
            <option value="">Select a reason</option>
            {Object.values(ReportReason).map((reasonOption) => (
              <option key={reasonOption} value={reasonOption}>
                {formatReasonLabel(reasonOption)}
              </option>
            ))}
          </select>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-[#2A1F33] text-white p-3 rounded-lg resize-none h-32 mb-4 border border-gray-700 focus:outline-none focus:border-purple-500"
            placeholder="Provide additional details about your report..."
          />

          <button
            onClick={handleSubmit}
            disabled={submitting || !description.trim() || !reason}
            className={`bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors duration-300 ${
              (submitting || !description.trim() || !reason) && 'opacity-50 cursor-not-allowed'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Report;