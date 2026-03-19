import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Donor, BloodGroup, BLOOD_GROUPS } from '@/types/donor';
import { subscribeToDonors, subscribeToDonorsByBloodGroup, addDonor } from '@/services/donorService';
import BloodFilterPills from '@/components/BloodFilterPills';
import DonorDetailSheet from '@/components/DonorDetailSheet';
import RegisterDonorDrawer from '@/components/RegisterDonorDrawer';
import { motion } from 'framer-motion';
import { UserPlus, Crosshair, Droplets, Users } from 'lucide-react';

const DARK_TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

const createDonorIcon = (bloodGroup: string, isActive: boolean) => {
  return L.divIcon({
    className: '',
    html: `<div class="donor-marker ${isActive ? 'active' : ''}" style="background: hsl(4 98% 30%); width: 32px; height: 32px;">${bloodGroup}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

const MapView = () => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const [donors, setDonors] = useState<Donor[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<BloodGroup | null>(null);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [showRegister, setShowRegister] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(true);

  const filteredDonors = useMemo(() => {
    if (!selectedFilter) return donors;
    return donors.filter((d) => d.bloodGroup === selectedFilter);
  }, [donors, selectedFilter]);

  const donorCounts = useMemo(() => {
    const counts: Record<BloodGroup, number> = {} as any;
    BLOOD_GROUPS.forEach((g) => (counts[g] = 0));
    donors.forEach((d) => counts[d.bloodGroup]++);
    return counts;
  }, [donors]);

  // Initialize map and Firestore subscription
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [23.8103, 90.4125],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });

    L.tileLayer(DARK_TILE_URL, {
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    // Try to get user location
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        map.setView([loc.lat, loc.lng], 14);
      },
      () => {} // silently fail
    );

    // Subscribe to Firestore data
    let unsubscribe: () => void;
    
    if (selectedFilter) {
      unsubscribe = subscribeToDonorsByBloodGroup(selectedFilter, (fetchedDonors) => {
        setDonors(fetchedDonors);
        setLoading(false);
      });
    } else {
      unsubscribe = subscribeToDonors((fetchedDonors) => {
        setDonors(fetchedDonors);
        setLoading(false);
      });
    }

    return () => {
      map.remove();
      mapRef.current = null;
      if (unsubscribe) unsubscribe();
    };
  }, [selectedFilter]);

  // Update markers
  useEffect(() => {
    if (!markersRef.current) return;
    markersRef.current.clearLayers();

    filteredDonors.forEach((donor) => {
      const marker = L.marker([donor.lat, donor.lng], {
        icon: createDonorIcon(donor.bloodGroup, donor.status === 'active'),
      });
      marker.on('click', () => setSelectedDonor(donor));
      markersRef.current?.addLayer(marker);
    });
  }, [filteredDonors]);

  const handleLocateMe = useCallback(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(loc);
        mapRef.current?.setView([loc.lat, loc.lng], 15, { animate: true });
      },
      () => alert('Could not get your location')
    );
  }, []);

  const handleRegister = useCallback(async (donor: Omit<Donor, 'id'>) => {
    try {
      const docId = await addDonor(donor);
      const newDonor: Donor = { ...donor, id: docId };
      mapRef.current?.setView([newDonor.lat, newDonor.lng], 15, { animate: true });
    } catch (error) {
      console.error('Error registering donor:', error);
      alert('Failed to register donor. Please try again.');
    }
  }, []);

  const activeDonors = donors.filter((d) => d.status === 'active').length;

  return (
    <div className="h-svh w-full fixed inset-0 overflow-hidden">
      {/* Map */}
      <div ref={mapContainerRef} className="h-full w-full" />

      {/* Top HUD - Stats Bar */}
      <div className="fixed top-0 left-0 right-0 z-[500] p-3 md:p-4">
        <div className="glass-surface rounded-2xl p-3 md:p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Droplets size={20} strokeWidth={1.5} className="text-primary" />
              <h1 className="text-sm md:text-base font-semibold text-foreground tracking-tight">HEMA</h1>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Users size={12} strokeWidth={1.5} />
                <span className="font-mono">{loading ? '...' : activeDonors}</span>
                <span className="hidden sm:inline">Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-mono">{loading ? '...' : filteredDonors.length}</span>
                <span>in view</span>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <BloodFilterPills
            selected={selectedFilter}
            onSelect={setSelectedFilter}
            donorCounts={donorCounts}
          />
        </div>
      </div>

      {/* Bottom Command Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[500] p-3 md:p-4">
        <div className="glass-surface rounded-2xl p-3 flex items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            <span className="font-mono font-bold text-foreground">{loading ? '...' : filteredDonors.length}</span> Donors
            {selectedFilter && <span className="ml-1">({selectedFilter})</span>}
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleLocateMe}
              className="p-2.5 rounded-xl glass-surface text-muted-foreground hover:text-foreground transition-colors"
              title="Find my location"
            >
              <Crosshair size={16} strokeWidth={1.5} />
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setShowRegister(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
            >
              <UserPlus size={14} strokeWidth={1.5} />
              <span className="hidden sm:inline">Register as Donor</span>
              <span className="sm:hidden">Register</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Donor Detail Sheet */}
      <DonorDetailSheet donor={selectedDonor} onClose={() => setSelectedDonor(null)} />

      {/* Register Drawer */}
      <RegisterDonorDrawer
        isOpen={showRegister}
        onClose={() => setShowRegister(false)}
        onRegister={handleRegister}
      />
    </div>
  );
};

export default MapView;
