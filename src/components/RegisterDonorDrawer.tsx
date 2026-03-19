import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, MapPin } from 'lucide-react';
import { BloodGroup, BLOOD_GROUPS, Donor } from '@/types/donor';

interface RegisterDonorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (donor: Omit<Donor, 'id'>) => void;
}

const panelVariants = {
  hidden: { y: "100%" },
  visible: { y: 0, transition: { type: "spring" as const, bounce: 0, duration: 0.4 } },
  exit: { y: "100%", transition: { duration: 0.25 } },
};

const RegisterDonorDrawer = ({ isOpen, onClose, onRegister }: RegisterDonorDrawerProps) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('A+');
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleGetLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        alert('Could not get your location. Please allow location access.');
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !coords) return;
    onRegister({
      name,
      phone,
      bloodGroup,
      lastDonated: new Date().toISOString().split('T')[0],
      lat: coords.lat,
      lng: coords.lng,
      status: 'active',
    });
    setName('');
    setPhone('');
    setCoords(null);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-background/50"
            onClick={onClose}
          />
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-0 left-0 right-0 z-[1001] md:left-auto md:right-0 md:top-0 md:w-96 md:bottom-0"
          >
            <div className="glass-surface rounded-t-2xl md:rounded-t-none md:rounded-l-2xl p-6 h-full md:h-full overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <UserPlus size={18} strokeWidth={1.5} className="text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Register as Donor</h2>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Full Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Phone Number</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+880 1XXX XXXXXX"
                    className="w-full px-3 py-2.5 rounded-xl bg-muted/30 border border-border text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Blood Group</label>
                  <div className="grid grid-cols-4 gap-2">
                    {BLOOD_GROUPS.map((group) => (
                      <motion.button
                        key={group}
                        type="button"
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setBloodGroup(group)}
                        className={`py-2 rounded-xl font-mono font-bold text-sm transition-all border ${
                          bloodGroup === group
                            ? 'bg-primary border-primary/50 text-primary-foreground'
                            : 'bg-muted/30 border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {group}
                      </motion.button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Location</label>
                  {coords ? (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-muted/30 border border-border text-sm text-foreground">
                      <MapPin size={14} strokeWidth={1.5} className="text-green-400" />
                      <span>{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
                    </div>
                  ) : (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.96 }}
                      onClick={handleGetLocation}
                      disabled={locating}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-muted/30 border border-border text-sm text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
                    >
                      <MapPin size={14} strokeWidth={1.5} />
                      {locating ? 'Getting location...' : 'Capture My Location'}
                    </motion.button>
                  )}
                </div>

                <motion.button
                  type="submit"
                  whileTap={{ scale: 0.96 }}
                  disabled={!name || !phone || !coords}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm mt-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Register & Go Active
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RegisterDonorDrawer;
