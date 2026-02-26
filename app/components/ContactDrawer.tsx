"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  open: Boolean;
  onClose: () => void;
}

export default function ContactDrawer({ open, onClose }: Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* OVERLAY */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black backdrop-blur-sm z-40"
          />

          {/* DRAWER */}
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            className="fixed top-0 left-0 w-full h-full bg-gradient-to-b from-[#0f2a6b] to-[#1c398e] z-50 flex justify-center overflow-y-auto"
          >
            <div className="relative w-full max-w-3xl px-6 py-24 text-white">

              {/* CLOSE BUTTON */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition"
              >
                <X />
              </button>

              {/* TITLE */}
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-4xl font-semibold text-center mb-10 tracking-wide"
              >
                Avvia una collaborazione strategica
              </motion.h2>

              {/* FORM */}
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                {/* EMAIL */}
                <Input label="Email *" type="email" placeholder="nome@azienda.com" />

                {/* NAME */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Input label="Nome *" />
                  <Input label="Cognome *" />
                </div>

                {/* CHECKBOX SECTION */}
                <div>
                  <p className="mb-4 font-medium">
                    Interesse strategico
                  </p>

                  <Checkbox label="Entrare in produzione di grande serie APWEC" />
                  <Checkbox label="Sviluppo di una o più Famiglie di Potenza" />
                  <Checkbox label="Operatività in specifici Areali geografici" />
                  <Checkbox label="Acquisto licenza industriale del prodotto" />
                </div>

                {/* MESSAGE */}
                <div>
                  <label className="block mb-2">Messaggio *</label>
                  <textarea
                    rows={5}
                    className="w-full rounded-2xl bg-white/10 border border-white/20 p-4 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/40 transition"
                    placeholder="Descrivi il tuo progetto, area di interesse o richiesta di licenza..."
                  />
                </div>

                {/* SUBMIT */}
                <motion.button
                  whileHover={{
                    boxShadow:
                      "0px 0px 20px rgba(255,255,255,0.4)",
                  }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full h-14 rounded-full bg-white text-[#1c398e] font-semibold text-lg transition"
                >
                  Invia richiesta
                </motion.button>
              </motion.form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Input({
  label,
  type = "text",
  placeholder,
}: {
  label: string;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block mb-2">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full h-14 rounded-2xl bg-white/10 border border-white/20 px-4 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/40 transition"
      />
    </div>
  );
}

function Checkbox({ label }: { label: string }) {
  return (
    <label className="flex items-center gap-3 mb-3 cursor-pointer group">
      <input
        type="checkbox"
        className="w-5 h-5 accent-white"
      />
      <span className="group-hover:text-white transition text-white/80">
        {label}
      </span>
    </label>
  );
}