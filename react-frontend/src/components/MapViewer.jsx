import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';

// Fix leaf icon default paths for React Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function MapViewer({ showResults }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [cafes, setCafes] = useState([]);
  const [userLoc, setUserLoc] = useState(null);
  const userMarkerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, { zoomControl: true }).setView([47.615, -122.33], 13);
    mapInstance.current = map;

    const darkLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors', maxZoom: 19,
      className: 'map-tiles-dark'
    });

    const lightLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors', maxZoom: 19
    });

    lightLayer.addTo(map);

    const baseMaps = {
      "Day Map": lightLayer,
      "Night Map": darkLayer
    };

    L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);

    // Sneakily grab the real-world GPS coordinates if they click "Allow"
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLoc({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        map.flyTo([pos.coords.latitude, pos.coords.longitude], 14, { duration: 2 });
      }, (err) => console.warn("GPS Denied by user. Defaulting to Seattle array.", err));
    }

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Fetch cafes exclusively when showResults magically turns on
  useEffect(() => {
    if (!showResults) return;
    
    let url = 'http://localhost:3000/api/cafes';
    if (userLoc) url += `?lat=${userLoc.lat}&lon=${userLoc.lon}`;
    
    fetch(url)
      .then(res => res.json())
      .then(data => {
          setCafes(data);
      })
      .catch(err => console.error('Map fetch error:', err));
  }, [showResults]);

  // Handle dragging/updating the user marker entirely independently of the cafes array
  useEffect(() => {
    if (!mapInstance.current || !userLoc) return;
    
    if (!userMarkerRef.current) {
        const userIcon = L.divIcon({
            className: 'user-pin',
            html: `<div class="cursor-pointer relative flex items-center justify-center"><div class="absolute w-8 h-8 rounded-full bg-[#4285F4] animate-ping opacity-50"></div><div class="w-5 h-5 bg-[#4285F4] border-2 border-white rounded-full z-10 shadow-[0_0_8px_rgba(0,0,0,0.5)]"></div></div>`,
            iconSize: [20, 20], iconAnchor: [10, 10]
        });
        userMarkerRef.current = L.marker([userLoc.lat, userLoc.lon], { icon: userIcon, zIndexOffset: 1000 })
         .addTo(mapInstance.current)
         .bindPopup("<div style=\"font-family:'VT323';font-size:16px\"><b>YOU ARE HERE</b></div>");
    } else {
        userMarkerRef.current.setLatLng([userLoc.lat, userLoc.lon]);
    }
  }, [userLoc]);

  useEffect(() => {
    if (!mapInstance.current || cafes.length === 0) return;
    
    const icon = L.divIcon({
        className: 'custom-pin',
        html: `<div class="cursor-pointer"><div class="w-8 h-8 bg-retro-window text-retro-border border-4 border-retro-border flex items-center justify-center pixel-shadow relative text-lg font-bold">X</div></div>`,
        iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32]
    });

    const bounds = L.latLngBounds();
    if (userLoc) bounds.extend([userLoc.lat, userLoc.lon]); // Keep user inside camera frame when fitting cafes

    cafes.forEach(c => {
      const marker = L.marker(c.coords, { icon }).addTo(mapInstance.current);
      marker.bindPopup(`<div style="font-family:'VT323', monospace"><b style="font-size:18px">${c.name}</b><br/>STYLE: <span style="background:black;color:white">${c.noise}</span></div>`);
      bounds.extend(c.coords);
    });
    mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
  }, [cafes]);

  return (
    <div className="h-full w-full flex flex-col">
      <header className="bg-retro-panel p-2 border-b-4 border-retro-border flex items-center justify-between z-10 shrink-0">
        <h2 className="text-sm font-title text-retro-window mt-1">MAP_VIEWER.SYS (LIVE SECURE LINK)</h2>
      </header>
      
      <div className="flex-1 flex flex-col relative overflow-hidden retro-map-filter bg-retro-bg" id="map-wrapper">
        
        {/* TOP: Fixed Map Frame */}
        <div ref={mapRef} id="map" className="w-full flex-1 z-0 min-h-[40%]"></div>

        {/* GPS Snap Button */}
        <button 
           onClick={() => {
             if (userLoc && mapInstance.current) {
                 mapInstance.current.flyTo([userLoc.lat, userLoc.lon], 16, { duration: 1.2 });
             }
           }}
           className="absolute bottom-[calc(40%+1rem)] md:bottom-[calc(45%+1rem)] right-4 z-[1000] w-12 h-12 bg-retro-bg border-4 border-retro-border pixel-shadow flex items-center justify-center hover:bg-white retro-active text-2xl"
           title="Center on My Location"
        >
          📍
        </button>

        {/* BOTTOM: Permanent Results Panel */}
        <div id="results-panel" className="h-[40%] md:h-[45%] shrink-0 bg-retro-panel border-t-4 border-retro-border flex flex-col overflow-hidden">
            <header className="bg-retro-bg p-2 border-b-4 border-retro-border flex items-center justify-between shrink-0">
                <span className="text-sm font-title text-[#ffb6c1] mt-1 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full inline-block ${showResults ? 'bg-[#ffb6c1] animate-pulse' : 'bg-retro-text opacity-50'}`}></span> 
                    {showResults ? "Found_Spots.dat" : "Awaiting_Input.exe"}
                </span>
            </header>
            
            <div id="results-content" className="flex-1 overflow-y-auto">
                {!showResults ? (
                    /* The "FIND ME" Wait State */
                    <div className="w-full h-full flex items-center justify-center bg-retro-panel/30">
                        <p className="font-title text-3xl md:text-5xl text-retro-text opacity-30 tracking-[0.3em] animate-pulse">FIND ME</p>
                    </div>
                ) : (
                    /* The Populated Cafe Cards */
                    <div className="p-4 space-y-4 bg-retro-panel">
                      {cafes.map(c => (
                        <div key={c.id} className="p-3 bg-retro-window border-4 border-retro-border pixel-shadow cursor-pointer hover:bg-white transition-colors retro-active" onClick={() => {
                            mapInstance.current?.setView(c.coords, 16);
                        }}>
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-lg leading-tight">{c.name}</h3>
                            </div>
                            <p className="text-sm opacity-80 mb-2 break-words">{c.address}</p>
                            <div className="flex flex-wrap gap-1">
                                <span className="text-[0.6rem] bg-retro-bg text-retro-text px-1 py-0.5 border border-retro-border">{c.noise}</span>
                                <span className="text-[0.6rem] bg-retro-btn text-retro-border px-1 py-0.5 border border-retro-border">{c.reason}</span>
                            </div>
                        </div>
                      ))}
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
}
