import { Donor } from '@/types/donor';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Clock, MapPin, Droplets } from 'lucide-react';

interface DonorDetailSheetProps {
  donor: Donor | null;
  onClose: () => void;
}

const panelVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring" as const, bounce: 0, duration: 0.4 } },
  exit: { y: "100%", opacity: 0, transition: { duration: 0.25 } },
};

const desktopVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { type: "spring" as const, damping: 25, duration: 0.4 } },
  exit: { x: "100%", opacity: 0, transition: { duration: 0.25 } },
};

const DonorDetailSheet = ({ donor, onClose }: DonorDetailSheetProps) => {
  if (!donor) return null;

  const daysSinceLastDonation = Math.floor(
    (Date.now() - new Date(donor.lastDonated).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <AnimatePresence>
      {donor && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-background/40"
            onClick={onClose}
          />

          {/* Mobile bottom sheet */}
          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed bottom-0 left-0 right-0 z-[1001] md:hidden"
          >
            <div className="glass-surface rounded-t-2xl p-5 pb-8 mx-1 mb-0">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-mono font-bold text-sm text-primary-foreground">{donor.bloodGroup}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{donor.name}</h3>
                    <span className={`text-xs ${donor.status === 'active' ? 'text-green-400' : 'text-muted-foreground'}`}>
                      {donor.status === 'active' ? '● Active Now' : '○ Inactive'}
                    </span>
                  </div>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <InfoCard icon={<Droplets size={14} strokeWidth={1.5} />} label="Blood Group" value={donor.bloodGroup} mono />
                <InfoCard icon={<Clock size={14} strokeWidth={1.5} />} label="Last Donated" value={`${daysSinceLastDonation}d ago`} />
                <InfoCard icon={<MapPin size={14} strokeWidth={1.5} />} label="Location" value={`${donor.lat.toFixed(3)}, ${donor.lng.toFixed(3)}`} />
                <InfoCard icon={<Phone size={14} strokeWidth={1.5} />} label="Phone" value={donor.phone.slice(-4)} />
              </div>

              <motion.a
                whileTap={{ scale: 0.96 }}
                href={`tel:${donor.phone}`}
                className="block w-full text-center py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm"
              >
                Request Contact
              </motion.a>
            </div>
          </motion.div>

          {/* Desktop side panel */}
          <motion.div
            variants={desktopVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed top-4 right-4 bottom-4 w-80 z-[1001] hidden md:block"
          >
            <div className="glass-surface rounded-2xl p-5 h-full flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="font-mono font-bold text-base text-primary-foreground">{donor.bloodGroup}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-lg">{donor.name}</h3>
                    <span className={`text-xs ${donor.status === 'active' ? 'text-green-400' : 'text-muted-foreground'}`}>
                      {donor.status === 'active' ? '● Active Now' : '○ Inactive'}
                    </span>
                  </div>
                </div>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
                  <X size={18} strokeWidth={1.5} />
                </button>
              </div>

              <div className="space-y-3 flex-1">
                <InfoCard icon={<Droplets size={14} strokeWidth={1.5} />} label="Blood Group" value={donor.bloodGroup} mono />
                <InfoCard icon={<Clock size={14} strokeWidth={1.5} />} label="Last Donated" value={`${daysSinceLastDonation} days ago`} />
                <InfoCard icon={<MapPin size={14} strokeWidth={1.5} />} label="Coordinates" value={`${donor.lat.toFixed(4)}, ${donor.lng.toFixed(4)}`} />
                <InfoCard icon={<Phone size={14} strokeWidth={1.5} />} label="Phone" value={donor.phone} />
              </div>

              <motion.a
                whileTap={{ scale: 0.96 }}
                href={`tel:${donor.phone}`}
                className="block w-full text-center py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm mt-4"
              >
                Request Contact
              </motion.a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const InfoCard = ({ icon, label, value, mono }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) => (
  <div className="rounded-xl bg-muted/50 border border-border p-3">
    <div className="flex items-center gap-1.5 text-muted-foreground text-[10px] uppercase tracking-wider mb-1">
      {icon}
      {label}
    </div>
    <p className={`text-sm text-foreground ${mono ? 'font-mono font-bold' : ''}`}>{value}</p>
  </div>
);

export default DonorDetailSheet;
