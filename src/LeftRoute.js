import React, {useEffect,useState} from "react";
import L, { icon } from 'leaflet';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css'
import 'leaflet-routing-machine'
import { useMap } from "react-leaflet";

const LeafRoute = () =>{
    const map = useMap();

    const defaulticon = L.icon({
        iconUrl:'https://cdn-icons-png.flaticon.com/128/3089/3089803.png',
        iconSize:[30,30]
    })
    useEffect(()=>{
        const marker = L.marker([19.021824,73.052979]).addTo(map);
        const marker1 = L.marker([19.021824,73.052979],{icon:defaulticon}).addTo(map)
        map.on('click',function (e){
            //L.marker([e.latlng.lat,e.latlng.lng]).addTo(map);
            L.Routing.control({
                waypoints: [
                    L.latLng(19.021824,73.052979),
                    L.latLng(e.latlng.lat, e.latlng.lng)
                ],
                lineOptions: {
                    styles: [
                        {
                            color:"blue",
                            weight:6,
                            opacity:0.7
                        }
                    ]
                },
                routeWhileDragging: true,
                geocoder : L.Control.Geocoder.nominatim(),
                addWaypoints : true,
                draggableWaypoints : true,
                fitSelectedRoutes: true,
                showAlternatives : true
            }).on('routesfound', function(e){
                e.routes[0].coordinates.forEach((c,i)=>{
                    setTimeout(()=>{
                        marker1.setLatLng([c.lat,c.lng])
                    },100+i
                    )
                });
            }).addTo(map);
        });
        
    },[])
    return null
}

export default LeafRoute;