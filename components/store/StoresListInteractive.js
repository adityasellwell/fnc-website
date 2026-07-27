"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Clock,
  Phone,
  MessageCircle,
  Truck,
  Store as StoreIcon,
  Navigation,
  ChevronRight,
  Map,
} from "lucide-react";
import Button from "@/components/ui/Button";

function whatsAppLink(phone, message) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export default function StoresListInteractive({ stores = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all", "active", "coming-soon"

  const filteredStores = stores.filter((store) => {
    // 1. Filter by Tab
    if (activeTab === "active" && store.status !== "active") return false;
    if (activeTab === "coming-soon" && store.status === "active") return false;

    // 2. Filter by Search Query
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();
    const matchesName = store.name.toLowerCase().includes(query);
    const matchesCity = store.city.toLowerCase().includes(query);
    const matchesAddress = store.address.toLowerCase().includes(query);

    // Smart pincode mapping
    let matchesPincode = false;
    if (/^\d+$/.test(query)) {
      if (query.startsWith("400") && store.city === "Thane") matchesPincode = true;
    }

    return matchesName || matchesCity || matchesAddress || matchesPincode;
  });

  return (
    <div className="flex flex-col gap-8">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white border border-bordergray rounded-3xl p-5 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate" />
          <input
            type="text"
            placeholder="Search stores by city, address or pincode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-xl border border-bordergray font-body text-base text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex bg-warmwhite p-1 rounded-xl border border-bordergray shrink-0">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2.5 rounded-lg font-body text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "all" ? "bg-white text-charcoal shadow-sm" : "text-slate"
            }`}
          >
            All Cities ({stores.length})
          </button>
          <button
            onClick={() => setActiveTab("active")}
            className={`px-4 py-2.5 rounded-lg font-body text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "active" ? "bg-white text-fnc-green shadow-sm" : "text-slate"
            }`}
          >
            Live Stores ({stores.filter((s) => s.status === "active").length})
          </button>
          <button
            onClick={() => setActiveTab("coming-soon")}
            className={`px-4 py-2.5 rounded-lg font-body text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "coming-soon" ? "bg-white text-fnc-blue shadow-sm" : "text-slate"
            }`}
          >
            Coming Soon ({stores.filter((s) => s.status !== "active").length})
          </button>
        </div>
      </div>

      {/* Grid of Stores */}
      {filteredStores.length === 0 ? (
        <div className="text-center py-16 bg-white border border-bordergray rounded-3xl">
          <span className="text-4xl mb-3 block">📍</span>
          <h3 className="font-display text-lg font-bold text-charcoal">No stores found</h3>
          <p className="font-body text-sm text-slate mt-1 max-w-sm mx-auto">
            We couldn't find any F&C stores matching "{searchQuery}" under this tab. Try searching for "Thane" or "400607".
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => {
            const isActive = store.status === "active";
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${store.geo.lat},${store.geo.lng}`;

            return (
              <div
                key={store.id}
                className="bg-white border border-bordergray rounded-3xl shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden h-full group"
              >
                {/* Visual Header */}
                <div className="h-44 bg-warmwhite relative border-b border-bordergray flex items-center justify-center overflow-hidden">
                  <Map className="h-16 w-16 text-slate/25 absolute transform -rotate-12 scale-150" />
                  <div className="absolute top-4 right-4">
                    {isActive ? (
                      <span className="rounded-full bg-fnc-green/10 text-fnc-green font-body text-xs font-semibold px-3 py-1">
                        Open Now
                      </span>
                    ) : (
                      <span className="rounded-full bg-fnc-blue/10 text-fnc-blue font-body text-xs font-semibold px-3 py-1">
                        Coming Soon
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-4 left-6">
                    <span className="font-body text-xs font-bold text-fnc-red uppercase tracking-wider bg-offwhite/90 backdrop-blur-xs px-2 py-0.5 rounded shadow-sm">
                      {store.city}
                    </span>
                    <h3 className="font-display text-xl font-bold text-charcoal mt-1.5 drop-shadow-xs">
                      {store.name}
                    </h3>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-6 flex flex-col gap-4 flex-1">
                  <div className="flex flex-col gap-3 font-body text-sm text-slate flex-1">
                    <p className="flex items-start gap-2.5">
                      <MapPin className="h-4.5 w-4.5 text-fnc-red shrink-0 mt-0.5" />
                      <span>
                        {store.address}, {store.city}, {store.state}
                      </span>
                    </p>
                    {isActive ? (
                      <>
                        <p className="flex items-center gap-2.5">
                          <Clock className="h-4.5 w-4.5 text-fnc-red shrink-0" />
                          <span>{store.openingHours?.mon || "7:00 AM - 9:00 PM"}</span>
                        </p>
                        <a
                          href={`tel:${store.phone.replace(/\s+/g, "")}`}
                          className="flex items-center gap-2.5 hover:text-fnc-red transition-colors w-fit"
                        >
                          <Phone className="h-4.5 w-4.5 text-fnc-red shrink-0" />
                          <span>{store.phone}</span>
                        </a>
                      </>
                    ) : (
                      <p className="flex items-center gap-2.5 text-fnc-blue font-semibold bg-fnc-blue/5 p-2.5 rounded-xl border border-fnc-blue/10">
                        <Clock className="h-4.5 w-4.5 shrink-0" />
                        <span>Opening soon in your city!</span>
                      </p>
                    )}
                  </div>

                  {/* Fulfillment Badges */}
                  {isActive && (
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-bordergray">
                      {store.deliveryAvailable && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-fnc-blue/10 text-fnc-blue font-body text-xs font-semibold px-2.5 py-1">
                          <Truck className="h-3.5 w-3.5" />
                          Delivery
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 rounded-full bg-charcoal/5 text-charcoal font-body text-xs font-semibold px-2.5 py-1">
                        <StoreIcon className="h-3.5 w-3.5" />
                        Pickup
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2 pt-3 border-t border-bordergray mt-auto">
                    {isActive ? (
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          href={whatsAppLink(store.whatsapp, "Hi! I'd like to place an order.")}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="primary"
                          size="sm"
                          className="w-full flex items-center justify-center gap-1.5"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Order
                        </Button>
                        <Button
                          href={directionsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="outline"
                          size="sm"
                          className="w-full flex items-center justify-center gap-1.5 border-bordergray hover:border-charcoal"
                        >
                          <Navigation className="h-3.5 w-3.5 text-fnc-red" />
                          Directions
                        </Button>
                      </div>
                    ) : (
                      <Button
                        href="/franchise"
                        variant="outline"
                        size="sm"
                        className="w-full text-center border-bordergray hover:border-fnc-blue"
                      >
                        Franchise Opportunities
                      </Button>
                    )}
                    <Link
                      href={`/store/${store.slug}`}
                      className="font-body text-xs font-bold text-fnc-red hover:underline flex items-center justify-center gap-0.5 mt-1.5 py-1"
                    >
                      View Details &amp; Map
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
