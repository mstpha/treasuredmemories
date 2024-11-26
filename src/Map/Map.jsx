import React, { useState, useCallback, useEffect,useRef } from 'react';
import { MapContainer, TileLayer, ZoomControl} from 'react-leaflet';
import { Icon, latLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import api from "./../axiosConfig"
import MemoryList from '../Components/MemoryList';
import DoubleClickMarker from './DoubleClickMarker';
import { useUser } from '../context/userContext';
const customIcon = new Icon({
  iconUrl: '1.png',  // Using the local image file
  iconSize: [96, 96],  // Adjust size as needed
  iconAnchor: [16, 32]
});
function SearchControl({ map }) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        map.setView([lat, lon], 13);
      } else {
        alert('Location not found');
      }
    } catch (error) {
      console.error('Error searching for location:', error);
      alert('Error searching for location');
    }
  };

  return (
    <div className="absolute top-4 left-12 right-12 z-[1000] flex justify-center">
      <form onSubmit={handleSearch} className="w-full max-w-3xl">
        <div className="flex group focus-within:ring-2 focus-within:ring-pink-600 rounded-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a location..."
            className="w-full h-10 px-2 bg-[#2a102b] rounded-l-md text-white placeholder-gray-400 focus:outline-none"
          />
          <button 
            type="submit" 
            className="px-6 h-10 bg-[#2a102b] text-white rounded-r-md hover:bg-[#3c173d] focus:outline-none"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
}




function Map() {
  const [map, setMap] = useState(null);
  const [isMemoryListOpen, setIsMemoryListOpen] = useState(false);

  const [markers, setMarkers] = useState([]);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const mapRef = useRef(null)
  const {updateUser,setMapControls,isAnyModalOpen,updateMemoriesShowcase,user,setIsAnyModalOpen,memid}=useUser()
  const [userMemories,setUserMemories]=useState([])
  const fetchdata = async ()=>{
    const localstorageuser=JSON.parse(localStorage.getItem('user'));
    updateUser(localstorageuser.name,localstorageuser.id);
    try{
      const response = await api.get(`/memory/user/${memid?memid:localstorageuser.id}`);
      if (response.status==200){
        setUserMemories(response.data)

        const memoryMarkers = response.data.map(memory => ({
          id: memory.id,
          position: {
            lat: parseFloat(memory.Location.latitude),
            lng: parseFloat(memory.Location.longitude)
          },
          title: memory.title,
          description: memory.description,
          locationName: memory.Location.name
        }));
        setMarkers(memoryMarkers);        }
  }
  catch(error){
    console.error("error:",error)
  }

}
  useEffect(()=>{

  fetchdata()
},[memid])
useEffect(()=>{
  updateMemoriesShowcase(user.id)
},[])
  const maxBounds = latLngBounds(
    [-90, -180],
    [90, 180]
  );
  const handleOpenMemoryList = () => {
    setIsMemoryListOpen(true);
    setIsAnyModalOpen(true); // Set modal state in context
  };

  const handleCloseMemoryList = () => {
    setIsMemoryListOpen(false);
    setIsAnyModalOpen(false); // Clear modal state in context
  };


  const toggleProfile = useCallback(() => {
    setIsProfileOpen(prev => !prev);
  }, []);
  const disableMap = useCallback(() => {
    if (mapRef.current) {
      // Disable all map interactions except double click
      mapRef.current.dragging.disable();
      mapRef.current.touchZoom.disable();
      mapRef.current.scrollWheelZoom.disable();
      mapRef.current.boxZoom.disable();
      mapRef.current.keyboard.disable();
      if (mapRef.current.tap) mapRef.current.tap.disable();
      
      // Remove zoom control
      mapRef.current.zoomControl?.remove();
    }
}, []);
  
const enableMap = useCallback(() => {
  if (mapRef.current) {
    // Re-enable all map interactions
    mapRef.current.dragging.enable();
    mapRef.current.touchZoom.enable();
    mapRef.current.scrollWheelZoom.enable();
    mapRef.current.boxZoom.enable();
    mapRef.current.keyboard.enable();
    
    // Restore zoom control
    mapRef.current.zoomControl?.addTo(mapRef.current);
  }
}, []);
  useEffect(() => {
    if (isAnyModalOpen) {
      disableMap();
    } else {
      enableMap();
    }
  }, [isAnyModalOpen, disableMap, enableMap]);


  const handleSetMap = useCallback((mapInstance) => {
    setMap(mapInstance);
    mapRef.current = mapInstance;
  }, []);

  useEffect(() => {
    setMapControls(disableMap, enableMap);
  }, [disableMap, enableMap, setMapControls]);
 // In the Map component, update the return statement:

return (
<div className="w-screen h-screen relative">
<button 
      onClick={() => {
        setIsAnyModalOpen(true);  // Add this
        handleOpenMemoryList();
      }}
      className="absolute top-4 right-4 z-[1001] bg-[#2a102b] hover:bg-[#3c173d] text-white px-4 py-2 rounded-md transition-colors duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-pink-600 shadow-lg"
    >
      View All Memories
    </button>

    <MapContainer 
      center={[36.8065, 10.1815]}
      zoom={12} 
      className='h-[95%] w-full'
      minZoom={3}  
      maxZoom={18}
      maxBounds={maxBounds}
      doubleClickZoom={false} 
      maxBoundsViscosity={1.0}
      ref={handleSetMap}
    >
      {map && <SearchControl map={map} />}
      <ZoomControl position="bottomright" />
      
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      />

      <DoubleClickMarker 
        onModalOpen={() => {
          setIsAnyModalOpen(true);
          disableMap();
        }}
        onModalClose={() => {
          setIsAnyModalOpen(false);
          enableMap();
        }}
        onMemoryDeleted={fetchdata}
        markers={markers} 
        setMarkers={setMarkers} 
        ownerId={memid?memid:JSON.parse(localStorage.getItem('user')).id}
      />

    </MapContainer>

    <MemoryList 
      isOpen={isMemoryListOpen}

      onClose={() => {
        setIsAnyModalOpen(false);
        handleCloseMemoryList();
      }}
      map={map}
    />
  </div>
);
}

export default Map;