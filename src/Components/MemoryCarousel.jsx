import React, { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Memory from "./Memory"

const MemoryCarousel = ({ memories,onMemoryDeleted }) => {
  const [startIndex, setStartIndex] = useState(0);
  const [memid, setMemid] = useState();
  
  const [visibleCount, setVisibleCount] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (memories.length < 5) {
      setVisibleCount(memories.length);
    }
  }, [memories.length]);

  const nextMemory = () => {
    setStartIndex((prevIndex) => (prevIndex + 1) % memories.length);
  };

  const prevMemory = () => {
    setStartIndex((prevIndex) => (prevIndex - 1 + memories.length) % memories.length);
  };

  // Calculate the width of each memory card
  const memoryWidth = `calc(${100 / 5}% - 8px)`; // 5 is max visible count, 8px accounts for gap

  return (
    <div className="w-full relative">
      <div className="flex justify-start items-center space-x-2 mt-[4vh]">
        {[...Array(visibleCount)].map((_, index) => {
          const memoryIndex = (startIndex + index) % memories.length;
          const memory = memories[memoryIndex];
          const imageUrl = memory?.images?.length > 0 ? 
            `http://localhost:5000/${JSON.parse(memory.images)[0]}` : 
            'default-image.jpg';
 
          return (
            <div 
            key={`${startIndex}-${index}-${memory?.id}`}
            className="relative"
              style={{ 
                width: memoryWidth,
                flexShrink: 0,
                flexGrow: 0
              }}
            >
              <div 
                onClick={() => {
                  setMemid(memory?.id);
                  setIsModalOpen(true);
                }}
                className="aspect-square bg-cover bg-center rounded-lg cursor-pointer"
                style={{
                  backgroundImage: `url(${imageUrl})`
                }}
              >
                <div className="absolute bottom-0 w-full bg-black bg-opacity-50 p-2 rounded-b-lg">
                  <span className="text-white text-sm">{memory?.name}</span>
                </div>
              </div>
              {index === 0 && memories.length > 1 && (
                <button 
                  onClick={prevMemory} 
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-200 rounded-full"
                >
                  <ChevronLeft color="black" size={24} />
                </button>
              )}
              {index === visibleCount - 1 && memories.length > 1 && (
                <button 
                  onClick={nextMemory} 
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-gray-200 rounded-full"
                >
                  <ChevronRight color="black" size={24} />
                </button>
              )}
            </div>
          );
        })}
      </div>
      <Memory 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        memoryId={memid}
        onMemoryDeleted={onMemoryDeleted}
      />
    </div>
  );
};

export default MemoryCarousel;