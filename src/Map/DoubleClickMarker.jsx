import React, { useState, useEffect } from 'react';
import { Marker, useMapEvents } from 'react-leaflet';
import { Icon } from 'leaflet';
import MemoryModal from './MemoryModal';
import Memory from '../Components/Memory';
import { useUser } from '../context/userContext';

const customIcon = new Icon({
  iconUrl: '1.png',
  iconSize: [96, 96],
  iconAnchor: [16, 32]
});

async function fetchLocationName(lat, lng) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
    const data = await response.json();
    return data.display_name || 'Unknown location';
  } catch (error) {
    console.error('Error fetching location name:', error);
    return 'Unknown location';
  }
}

function DoubleClickMarker({ markers, setMarkers, onModalOpen, onModalClose, ownerId,onMemoryDeleted }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [tempMarker, setTempMarker] = useState(null);
  const { isAnyModalOpen, setIsAnyModalOpen, user } = useUser();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memid, setMemid] = useState();

  // Get map instance for event handling
  const map = useMapEvents({
    dblclick: async (e) => {
      if (!isAnyModalOpen && user.id === ownerId) {
        const { lat, lng } = e.latlng;
        const locationName = await fetchLocationName(lat, lng);
        
        setTempMarker({
          position: { lat, lng },
          locationName
        });
        
        setModalOpen(true);
        setIsAnyModalOpen(true);
        onModalOpen();
      }
    }
  });

  useEffect(() => {
    if (modalOpen || isModalOpen) {
      onModalOpen();
    } else {
      onModalClose();
    }
  }, [modalOpen, isModalOpen, onModalOpen, onModalClose]);

  const handleSubmit = async (memoryData) => {
    const newMarker = {
      id: memoryData.id,
      position: {
        lat: memoryData.location.latitude,
        lng: memoryData.location.longitude
      },
      title: memoryData.title,
      description: memoryData.description,
      locationName: memoryData.location.name
    };
    
    setMarkers(prevMarkers => [...prevMarkers, newMarker]);
    setModalOpen(false);
    setTempMarker(null);
    setIsAnyModalOpen(false);
    onModalClose();
  };

  const handleClose = () => {
    setIsAnyModalOpen(false);
    setModalOpen(false);
    setTempMarker(null);
    onModalClose();
  };

  return (
    <>
      {markers.map(marker => (
        <Marker 
          key={marker.id} 
          position={marker.position} 
          icon={customIcon}
          eventHandlers={{
            click: () => {
              setIsAnyModalOpen(true);
              setMemid(marker.id);
              setIsModalOpen(true);
              onModalOpen();
            }
          }}
        />
      ))}
      
      {modalOpen && (
        <MemoryModal 
          isOpen={modalOpen}
          onClose={handleClose}
          onSubmit={handleSubmit}
          locationName={tempMarker?.locationName || ''}
          position={tempMarker?.position}
        />
      )}
      
      {isModalOpen && (
        <Memory 
          isOpen={isModalOpen}
          onMemoryDeleted={onMemoryDeleted}

          onClose={() => {
            setIsAnyModalOpen(false);
            setIsModalOpen(false);
            onModalClose();
          }}
          memoryId={memid}
        />
      )}
    </>
  );
}

export default DoubleClickMarker;