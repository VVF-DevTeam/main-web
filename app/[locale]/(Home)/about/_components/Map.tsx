"use client"

import { useEffect, useRef } from "react"
import { Loader } from "@googlemaps/js-api-loader"

interface MapProps {
  address: string
}

const Map: React.FC<MapProps> = ({ address }) => {
  const mapRef = useRef<HTMLDivElement | null>(null)
 
  useEffect(() => {
    if (!address) {
      console.error("Address is missing.")
      return
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.error("Google Maps API key is missing.")
      return
    }

    const loader = new Loader({
      apiKey: apiKey,
      version: "weekly",
    })

    const initializeMap = async () => {
      try {
        const { Map } = (await loader.importLibrary("maps")) as google.maps.MapsLibrary
        const { Geocoder } = (await loader.importLibrary("geocoding")) as google.maps.GeocodingLibrary
        const { AdvancedMarkerElement } = (await loader.importLibrary("marker")) as google.maps.MarkerLibrary

        if (!mapRef.current) {
          console.error("Map container is not available.")
          return
        }

        const geocoder = new Geocoder()

        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results?.[0]?.geometry?.location) {
            const location = results[0].geometry.location

            const map = new Map(mapRef.current as HTMLElement, {
              center: location,
              zoom: 16,
              mapTypeId: "roadmap",
              mapId: 'DEMO_MAP_ID', // Include the Map ID
            })

            // Add a marker
            const marker = new AdvancedMarkerElement({
              map: map,
              position: location,
              title: address,
            })

            const infowindow = new google.maps.InfoWindow({
                content: address,
                ariaLabel: "Uluru",
            })

            marker.addListener("click", () => {
                infowindow.open({
                  anchor: marker,
                  map,
                });
              });

          } else {
            console.error(`Geocode failed. Status: ${status}, Results: ${results}`)
          }
        })
      } catch (error) {
        console.error("Failed to initialize Google Maps:", error)
      }
    }

    initializeMap()
  }, [address])

  return (
    <div className="bg-[#EFB9A2]/20 px-6 py-32">
        <h1 className="mb-20 text-center text-3xl font-semibold tracking-wide md:text-4xl lg:text-5xl">
            Our Location
        </h1>
        <div className="h-[600px] w-full" ref={mapRef}/>
    </div>
  )
}

export default Map
