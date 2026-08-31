import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useCadastre } from '../../context/CadastreContext';

interface LeafletMapWidgetProps {
  height?: string;
  showControls?: boolean;
  interactive?: boolean;
  onParcelSelect?: (parcelId: string) => void;
}

export const LeafletMapWidget: React.FC<LeafletMapWidgetProps> = ({
  height = '100%',
  showControls = true,
  interactive = true,
  onParcelSelect,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const { parcels, selectedParcelId, setSelectedParcelId } = useCadastre();

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix leaflet default marker icons in bundlers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });

    const selectedP = parcels.find((p) => p.id === selectedParcelId) || parcels[0];
    const initialCenter: [number, number] = [selectedP?.latitude || 12.9716, selectedP?.longitude || 77.5946];

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 18,
      zoomControl: showControls,
      attributionControl: false,
      dragging: interactive,
      touchZoom: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
    });
    mapInstanceRef.current = map;

    // Base Tile Layer (Standard Light OpenStreetMap Tiles)
    const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';

    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 20,
      maxNativeZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Render Parcels
    const features: any = {
      type: 'FeatureCollection',
      features: parcels.map((p) => ({
        ...p.boundaryGeoJSON,
        id: p.id,
        properties: {
          ...p.boundaryGeoJSON.properties,
          id: p.id,
          localParcelId: p.localParcelId,
          ulpin: p.ulpin,
          landUse: p.landUse,
        },
      })),
    };

    const geojsonLayer = L.geoJSON(features, {
      style: (feature) => {
        const isSelected = feature?.properties.id === selectedParcelId;
        return {
          color: isSelected ? '#2563eb' : '#059669',
          weight: isSelected ? 3 : 2,
          fillColor: isSelected ? '#3b82f6' : '#10b981',
          fillOpacity: isSelected ? 0.35 : 0.15,
        };
      },
      onEachFeature: (feature, layer) => {
        const props = feature.properties;
        layer.bindTooltip(
          `<div class="font-sans text-xs">
            <div class="font-bold text-slate-900">${props.localParcelId}</div>
            <div class="font-mono text-[10px] text-slate-500">${props.ulpin}</div>
          </div>`,
          { permanent: false, direction: 'top' }
        );

        if (interactive) {
          layer.on({
            click: () => {
              const pid = props.id;
              setSelectedParcelId(pid);
              if (onParcelSelect) onParcelSelect(pid);
            },
          });
        }
      },
    }).addTo(map);

    geojsonLayerRef.current = geojsonLayer;

    return () => {
      map.remove();
    };
  }, []);

  // Update styles & zoom when selected parcel changes
  useEffect(() => {
    if (!mapInstanceRef.current || !geojsonLayerRef.current) return;

    geojsonLayerRef.current.setStyle((feature: any) => {
      const isSelected = feature?.properties.id === selectedParcelId;
      return {
        color: isSelected ? '#2563eb' : '#059669',
        weight: isSelected ? 3 : 2,
        fillColor: isSelected ? '#3b82f6' : '#10b981',
        fillOpacity: isSelected ? 0.4 : 0.15,
      };
    });

    const targetP = parcels.find((p) => p.id === selectedParcelId);
    if (targetP && mapInstanceRef.current) {
      mapInstanceRef.current.setView([targetP.latitude, targetP.longitude], 18, { animate: true });
    }
  }, [selectedParcelId, parcels]);

  return (
    <div className="w-full relative overflow-hidden rounded-xl" style={{ height }}>
      <div ref={mapContainerRef} className="w-full h-full z-0" />
    </div>
  );
};