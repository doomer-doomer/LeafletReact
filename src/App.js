import logo from './logo.svg';
import './App.css';
import { Marker, Popup } from 'react-leaflet';
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import {useMapEvent, useMapEvents,Rectangle } from 'react-leaflet';
import React, {useCallback,useState,useMemo, useEffect} from 'react';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css'
import 'leaflet-control-geocoder/dist/Control.Geocoder.js'
import LeafGeo from './LeafGeo';
import LeafRoute from './LeftRoute';


function App() {
  const customicon = new Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/128/684/684908.png",
    iconSize: [30, 30]
  })

  const [map, setMap] = useState(null);
  const [routingControl, setRoutingControl] = useState(null);

  const handleClick = (e) => {
    if (map) {
      if (routingControl) {
        map.removeControl(routingControl);
      }
      
      const waypoints = [
        L.latLng(map.getCenter()), // Start point (current map center)
        e.latlng // Clicked point
      ];

      const control = L.Routing.control({
        waypoints,
        routeWhileDragging: true,
        lineOptions: {
          styles: [{ color: '#0078FF', weight: 6 }]
        },
        createMarker: function (i, waypoint, number) {
          return L.marker(waypoint.latLng, {
            icon: customicon
          }).bindPopup('Point ' + number);
        }
      }).addTo(map);

      setRoutingControl(control);
    }
  };

  function LocationMarker() {
    const [position, setPosition] = useState(null)
    const map = useMapEvents({
      click() {
        map.locate()
      },
      locationfound(e) {
        setPosition(e.latlng)
        map.flyTo(e.latlng, map.getZoom())
      },
    })
  
    return position === null ? null : (
      <Marker icon={customicon} position={position}>
        <Popup>You are here</Popup>
      </Marker>
    )
  }

  const POSITION_CLASSES = {
    bottomleft: 'leaflet-bottom leaflet-left',
    bottomright: 'leaflet-bottom leaflet-right',
    topleft: 'leaflet-top leaflet-left',
    topright: 'leaflet-top leaflet-right',
  }
  
  const BOUNDS_STYLE = { weight: 1 }
  
  function MinimapBounds({ parentMap, zoom }) {
    const minimap = useMap()

    // Clicking a point on the minimap sets the parent's map center
    const onClick = useCallback(
      (e) => {
        parentMap.setView(e.latlng, parentMap.getZoom())
      },
      [parentMap],
    )

    useMapEvents('click', onClick)

    // Keep track of bounds in state to trigger renders
    const [bounds, setBounds] = useState(parentMap.getBounds())
    const onChange = useCallback(() => {
      setBounds(parentMap.getBounds())
      // Update the minimap's view to match the parent map's center and zoom
      minimap.setView(parentMap.getCenter(), zoom)
    }, [minimap, parentMap, zoom])

    // Listen to events on the parent map
    useEffect(() => {
      parentMap.on('move', onChange)
      parentMap.on('zoom', onChange)
      return () => {
        parentMap.off('move', onChange)
        parentMap.off('zoom', onChange)
      }
    }, [parentMap, onChange])

    return <Rectangle bounds={bounds} pathOptions={BOUNDS_STYLE} />
  }

  function MinimapControl({ position, zoom }) {
    const parentMap = useMap()
    const mapZoom = zoom || 0

    // Memoize the minimap so it's not affected by position changes
    const minimap = useMemo(
      () => (
        <MapContainer
          style={{ height: 80, width: 80 }}
          center={parentMap.getCenter()}
          zoom={mapZoom}
          dragging={false}
          doubleClickZoom={false}
          scrollWheelZoom={false}
          attributionControl={false}
          zoomControl={false}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MinimapBounds parentMap={parentMap} zoom={mapZoom} />
        </MapContainer>
      ),
      [],
    )

    const positionClass =
      (position && POSITION_CLASSES[position]) || POSITION_CLASSES.topright
    return (
      <div className={positionClass}>
        <div className="leaflet-control leaflet-bar">{minimap}</div>
      </div>
    )
  }
  return (
    
      <MapContainer center={[19.021824,73.052979]} zoom={13} whenCreated={setMap} onClick={handleClick}>
        <TileLayer
        attribution='&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url='https://tile.openstreetmap.org/{z}/{x}/{y}.png'
        ></TileLayer>
        
        <MinimapControl position="bottomleft" />
        {/*<LeafGeo/> */}
        <LeafRoute/>
      </MapContainer>
    
  );
}

let DefaultIcon = L.icon({
  iconUrl:"https://cdn-icons-png.flaticon.com/128/684/684908.png",
  iconSize : [30,30]
})

L.Marker.prototype.options.icon = DefaultIcon;

export default App;
