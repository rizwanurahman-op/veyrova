"use client";

import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "919876543210";

  return (
    <a
      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I'm interested in your products!")}`}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Chat on WhatsApp"
      id="whatsapp-float-button"
    >
      <MessageCircle size={28} fill="white" />
    </a>
  );
}
