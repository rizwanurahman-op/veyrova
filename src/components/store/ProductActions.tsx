"use client";

import { MessageCircle } from "lucide-react";
import { InstagramIcon } from "@/components/icons";
import { getWhatsAppLink, getInstagramLink } from "@/lib/utils";

interface ProductActionsProps {
  product: {
    name: string;
    sku?: string | null;
    price: number;
  };
}

export default function ProductActions({ product }: ProductActionsProps) {
  return (
    <div className="space-y-3">
      <a
        href={getWhatsAppLink(product)}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-whatsapp w-full text-base py-4 rounded-xl"
        id="product-buy-whatsapp"
      >
        <MessageCircle size={20} fill="white" />
        Buy on WhatsApp
      </a>
      <a
        href={getInstagramLink()}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-instagram w-full text-base py-4 rounded-xl"
        id="product-order-instagram"
      >
        <InstagramIcon size={20} />
        Order via Instagram
      </a>
    </div>
  );
}
