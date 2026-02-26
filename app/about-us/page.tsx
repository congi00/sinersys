"use client";

import { motion } from "framer-motion";

export default function AboutUs() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -40 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen bg-white flex items-center justify-center"
    >
      <h1 className="text-4xl font-bold">About Us Page</h1>
    </motion.div>
  );
}