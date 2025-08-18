import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import truckAnim from '@/assets/Delivery truck.json';

function NotFound() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center"
    >
      <div className="text-center">
        <div className="w-64 mx-auto mb-6">
          <Lottie animationData={truckAnim} loop autoplay />
        </div>
        <h1 className="font-heading text-4xl mb-4">404 - Parcel Lost?</h1>
        <p className="mb-4">Page not found. Try tracking your parcel!</p>
        <Button asChild>
          <a href="/tracking">Go to Tracking</a>
        </Button>
      </div>
    </motion.div>
  );
}

export default NotFound;