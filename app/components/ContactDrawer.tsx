"use client";

import { m, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { X, Paperclip, FileText, Trash2, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  open: Boolean;
  onClose: () => void;
}

type Status = "idle" | "loading" | "success" | "error";

export default function ContactDrawer({ open, onClose }: Props) {
  const t = useTranslations("contacts");
  const f = useTranslations("contacts.fields");

  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Campi form
  const [email,     setEmail]     = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [message,   setMessage]   = useState("");

  // Validazione
  const [errors,    setErrors]    = useState<Record<string, string>>({});
  const [status,    setStatus]    = useState<Status>("idle");
  const [serverErr, setServerErr] = useState("");

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
  }, [open]);

  // Reset al richiudersi
  useEffect(() => {
    if (!open) {
      setTimeout(() => {
        setEmail(""); setFirstName(""); setLastName("");
        setInterests([]); setMessage(""); setFiles([]);
        setErrors({}); setStatus("idle"); setServerErr("");
      }, 400);
    }
  }, [open]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    setFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name + f.size));
      return [...prev, ...selected.filter((f) => !existing.has(f.name + f.size))];
    });
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

  function toggleInterest(value: string) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
    if (errors.interests) setErrors((e) => ({ ...e, interests: "" }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!email.trim())     e.email     = f("errorRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = f("errorEmail");
    if (!firstName.trim()) e.firstName = f("errorRequired");
    if (!lastName.trim())  e.lastName  = f("errorRequired");
    if (interests.length === 0) e.interests = f("errorInterest");
    if (!message.trim())   e.message   = f("errorRequired");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setStatus("loading");
    setServerErr("");

    const fd = new FormData();
    fd.append("email",     email);
    fd.append("firstName", firstName);
    fd.append("lastName",  lastName);
    interests.forEach((i) => fd.append("interests", i));
    fd.append("message",   message);
    files.forEach((file) => fd.append("attachments", file));

    try {
      const res = await fetch("/api/contact", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setServerErr(data.error ?? "Unknown error"); setStatus("error"); }
      else setStatus("success");
    } catch {
      setServerErr("Network error. Try later.");
      setStatus("error");
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <m.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black backdrop-blur-sm z-40"
          />

          {/* Drawer */}
          <m.div
            initial={{ y: "-100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
            style={{
              textAlign: "left",
              background: "linear-gradient(160deg, #1c398e 0%, #0070f3 100%)",
            }}
            className="fixed top-0 left-0 w-full h-full z-50 flex justify-center overflow-y-auto pt-[3px]"
            data-lenis-prevent
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="relative w-full max-w-3xl px-6 py-24 text-[#f4f7fa]" style={{ textAlign: "left" }}>
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition cursor-pointer"
              >
                <X />
              </button>

              {/* Title */}
              <m.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[2rem] font-semibold mb-10 sm:text-center tracking-wide"
              >
                {t("drawerTitle")}
              </m.h2>

              {/* SUCCESS STATE */}
              <AnimatePresence>
                {status === "success" && (
                  <m.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-4 py-16 text-center"
                  >
                    <CheckCircle size={56} className="text-white" />
                    <p className="text-xl font-semibold">{t("successTitle")}</p>
                    <p className="text-[#f4f7fa]/70">{t("successBody")}</p>
                    <button
                      onClick={onClose}
                      className="mt-4 px-8 py-3 rounded-full bg-white text-[#1c398e] font-semibold"
                    >
                      {t("close")}
                    </button>
                  </m.div>
                )}
              </AnimatePresence>

              {/* FORM */}
              {status !== "success" && (
                <m.form
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="space-y-6"
                  onSubmit={handleSubmit}
                  noValidate
                >
                  {/* Email */}
                  <Input
                    label={f("email")}
                    type="email"
                    placeholder={f("emailPlaceholder")}
                    value={email}
                    onChange={(v) => { setEmail(v); if (errors.email) setErrors((e) => ({ ...e, email: "" })); }}
                    error={errors.email}
                    aria-required="true"
                  />

                  {/* Name */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      label={f("firstName")}
                      value={firstName}
                      onChange={(v) => { setFirstName(v); if (errors.firstName) setErrors((e) => ({ ...e, firstName: "" })); }}
                      error={errors.firstName}
                      aria-required="true"
                    />
                    <Input
                      label={f("lastName")}
                      value={lastName}
                      onChange={(v) => { setLastName(v); if (errors.lastName) setErrors((e) => ({ ...e, lastName: "" })); }}
                      error={errors.lastName}
                      aria-required="true"
                    />
                  </div>

                  {/* Strategic interest */}
                  <div>
                    <p className="mb-4 font-medium">{f("interestTitle")}</p>
                    <Checkbox label={f("check0")} checked={interests.includes(f("check0"))} onChange={() => toggleInterest(f("check0"))} />
                    <Checkbox label={f("check2")} checked={interests.includes(f("check2"))} onChange={() => toggleInterest(f("check2"))} />
                    <Checkbox label={f("check3")} checked={interests.includes(f("check3"))} onChange={() => toggleInterest(f("check3"))} />
                    {errors.interests && <p className="mt-2 text-sm text-red-300">{errors.interests}</p>}
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block mb-2">{f("message")}</label>
                    <textarea
                      rows={5}
                      value={message}
                      onChange={(e) => { setMessage(e.target.value); if (errors.message) setErrors((er) => ({ ...er, message: "" })); }}
                      className="w-full rounded-2xl bg-white/10 border border-white/20 p-4 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-white/40 transition"
                      placeholder={f("messagePlaceholder")}
                      aria-required="true"
                    />
                    {errors.message && <p className="mt-1 text-sm text-red-300">{errors.message}</p>}
                  </div>

                  {/* File upload */}
                  <div>
                    <label className="block mb-3 font-medium">
                      {f("attachments")}
                      <span className="ml-2 text-[#f4f7fa]/50 text-sm font-normal">{f("attachmentsHint")}</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full rounded-2xl border border-dashed border-white/30 bg-white/5 hover:bg-white/10 transition p-6 flex flex-col items-center gap-2 cursor-pointer group"
                    >
                      <Paperclip size={22} className="text-[#f4f7fa]/50 group-hover:text-[#f4f7fa]/80 transition" />
                      <span className="text-sm text-[#f4f7fa]/60 group-hover:text-[#f4f7fa]/80 transition">{f("attachBtn")}</span>
                    </button>
                    <label className="block mb-2 mt-2 text-xs">{f("postilla")}</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp,.zip"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <AnimatePresence initial={false}>
                      {files.length > 0 && (
                        <m.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3 space-y-2 overflow-hidden"
                        >
                          {files.map((file, i) => (
                            <m.li
                              key={file.name + file.size}
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 12 }}
                              transition={{ duration: 0.2 }}
                              className="flex items-center gap-3 rounded-xl bg-white/10 border border-white/15 px-4 py-3"
                            >
                              <FileText size={16} className="text-[#f4f7fa]/60 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm truncate text-[#f4f7fa]/90">{file.name}</p>
                                <p className="text-xs text-[#f4f7fa]/45">{formatSize(file.size)}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeFile(i)}
                                className="flex-shrink-0 w-7 h-7 rounded-lg hover:bg-white/15 flex items-center justify-center transition"
                              >
                                <Trash2 size={14} className="text-[#f4f7fa]/50 hover:text-[#f4f7fa]/80" />
                              </button>
                            </m.li>
                          ))}
                        </m.ul>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Server error */}
                  {status === "error" && serverErr && (
                    <div className="flex items-center gap-2 rounded-xl bg-red-500/20 border border-red-400/40 px-4 py-3 text-sm text-red-200">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      {serverErr}
                    </div>
                  )}

                  {/* Submit */}
                  <m.button
                    type="submit"
                    disabled={status === "loading"}
                    whileHover={{ boxShadow: status !== "loading" ? "0px 0px 20px rgba(255,255,255,0.4)" : undefined }}
                    whileTap={{ scale: status !== "loading" ? 0.97 : 1 }}
                    className="w-full h-14 rounded-full bg-white text-[#1c398e] font-semibold text-lg transition mb-[20px] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {status === "loading" ? "Invio in corso…" : f("submit")}
                  </m.button>
                </m.form>
              )}
            </div>
          </m.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Sub-components ────────────────────────────────────────────────────

function Input({
  label, type = "text", placeholder, value, onChange, error,
}: {
  label: string; type?: string; placeholder?: string;
  value: string; onChange: (v: string) => void; error?: string;
}) {
  return (
    <div>
      <label className="block mb-2">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-14 rounded-2xl bg-white/10 border px-4 backdrop-blur-md focus:outline-none focus:ring-2 transition
          ${error ? "border-red-400 focus:ring-red-400/40" : "border-white/20 focus:ring-white/40"}`}
      />
      {error && <p className="mt-1 text-sm text-red-300">{error}</p>}
    </div>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-3 mb-3 cursor-pointer group">
      <input type="checkbox" checked={checked} onChange={onChange} className="w-5 h-5 accent-white" />
      <span className="group-hover:text-[#f4f7fa] transition text-[#f4f7fa]/80">{label}</span>
    </label>
  );
}