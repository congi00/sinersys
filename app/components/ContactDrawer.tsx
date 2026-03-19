"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { X, Paperclip, FileText, Trash2 } from "lucide-react";

interface Props {
  open: Boolean;
  onClose: () => void;
}

export default function ContactDrawer({ open, onClose }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [open]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      const newFiles = selected.filter((f) => !existing.has(f.name + f.size));
      return [...prev, ...newFiles];
    });
    // reset input so same file can be re-added after removal
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

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
            style={{ textAlign: "left" }}
            className="fixed top-0 left-0 w-full h-full bg-gradient-to-b from-[#1c398e] to-[#0f2a6b] z-50 flex justify-center overflow-y-auto pt-[3px]"
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-3xl px-6 py-24 text-white" style={{ textAlign: "left" }}>

              {/* CLOSE BUTTON */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition cursor-pointer"
              >
                <X />
              </button>

              {/* TITLE */}
              <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[2rem] font-semibold mb-10 sm:text-center tracking-wide"
              >
                AVVIA UNA COLLABORAZIONE STRATEGICA
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
                  <p className="mb-4 font-medium">Interesse strategico</p>
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

                {/* FILE UPLOAD */}
                <div>
                  <label className="block mb-3 font-medium">
                    Allegati
                    <span className="ml-2 text-white/50 text-sm font-normal">
                      (opzionale — PDF, DOC, immagini, max 10 MB per file)
                    </span>
                  </label>

                  {/* Drop zone / button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full rounded-2xl border border-dashed border-white/30 bg-white/5 hover:bg-white/10 transition p-6 flex flex-col items-center gap-2 cursor-pointer group"
                  >
                    <Paperclip
                      size={22}
                      className="text-white/50 group-hover:text-white/80 transition"
                    />
                    <span className="text-sm text-white/60 group-hover:text-white/80 transition">
                      Clicca per allegare un file
                    </span>
                  </button>

                  {/* Hidden input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp,.zip"
                    onChange={handleFileChange}
                    className="hidden"
                  />

                  {/* File list */}
                  <AnimatePresence initial={false}>
                    {files.length > 0 && (
                      <motion.ul
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 space-y-2 overflow-hidden"
                      >
                        {files.map((file, i) => (
                          <motion.li
                            key={file.name + file.size}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 12 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 px-4 py-3"
                          >
                            <FileText size={16} className="text-white/60 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm truncate text-white/90">{file.name}</p>
                              <p className="text-xs text-white/45">{formatSize(file.size)}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              className="flex-shrink-0 w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center transition"
                            >
                              <Trash2 size={14} className="text-white/50 hover:text-white/80" />
                            </button>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                {/* SUBMIT */}
                <motion.button
                  whileHover={{ boxShadow: "0px 0px 20px rgba(255,255,255,0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full h-14 rounded-full bg-white text-[#1c398e] font-semibold text-lg transition mb-[20px]"
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
      <input type="checkbox" className="w-5 h-5 accent-white" />
      <span className="group-hover:text-white transition text-white/80">{label}</span>
    </label>
  );
}