"use client";

import { useState } from "react";
import { Flame, Eye, Download, Sparkles, ShieldAlert, BadgeCheck } from "lucide-react";
import Button from "@/components/ui/Button";

export default function MenuClient({ menuData }) {
  const [activeCategory, setActiveCategory] = useState(menuData.categories[0].id);

  const activeCategoryData = menuData.categories.find(
    (cat) => cat.id === activeCategory
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Upper Action Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white border border-bordergray rounded-3xl p-5 shadow-sm">
        <div className="text-center md:text-left">
          <h3 className="font-display text-lg font-bold text-charcoal">
            Want to see the printed Menu Card?
          </h3>
          <p className="font-body text-xs text-slate mt-1">
            You can view or download the official physical menu card layout directly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            href="https://share.google/bJPdnV23o229Ykbo9"
            target="_blank"
            rel="noopener noreferrer"
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4 text-fnc-red" />
            View Menu Card
          </Button>
          <a
            href="https://share.google/bJPdnV23o229Ykbo9"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-xl border border-bordergray bg-charcoal text-white hover:bg-black font-body text-xs font-semibold transition-colors"
          >
            <Download className="h-4 w-4" />
            Download
          </a>
        </div>
      </div>

      {/* Categories Tabs Selector */}
      <div className="flex overflow-x-auto gap-2 pb-3 -mx-4 px-4 scrollbar-none md:mx-0 md:px-0 justify-start md:justify-center">
        {menuData.categories.map((cat) => {
          const isActive = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-full font-body text-sm font-semibold transition-all shrink-0 border ${
                isActive
                  ? "bg-fnc-red border-fnc-red text-white shadow-sm"
                  : "bg-white border-bordergray text-slate hover:text-charcoal hover:border-slate"
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Dynamic Content Area */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* Left Side: Items list */}
        <div className="bg-white border border-bordergray rounded-3xl p-6 sm:p-8 shadow-sm min-h-[400px]">
          <div className="mb-6 border-b border-bordergray pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-charcoal">
                {activeCategoryData.name}
              </h2>
              {activeCategoryData.startingPrice && (
                <span className="font-display text-sm font-extrabold text-white bg-fnc-red px-3 py-1 rounded-full uppercase tracking-wider">
                  {activeCategoryData.startingPrice}
                </span>
              )}
            </div>
            <p className="font-body text-sm text-slate mt-2">
              {activeCategoryData.subtitle}
            </p>
            {activeCategoryData.badge && (
              <span className="inline-block mt-3 text-xs font-bold text-fnc-green bg-fnc-green/10 px-3 py-1 rounded-lg">
                ✦ {activeCategoryData.badge}
              </span>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {activeCategoryData.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-2xl border border-bordergray bg-warmwhite/50 hover:bg-warmwhite hover:border-slate/30 transition-all duration-200 group"
              >
                <div className="flex flex-col">
                  <span className="font-body text-base font-bold text-charcoal flex items-center gap-1.5">
                    {item.name}
                    {item.spicy && (
                      <Flame className="h-4 w-4 text-fnc-red fill-fnc-red inline-block" />
                    )}
                  </span>
                  {item.detail && (
                    <span className="font-body text-xs text-slate mt-0.5">
                      ({item.detail})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.originalPrice && (
                    <span className="font-body text-xs text-slate line-through">
                      {item.originalPrice}
                    </span>
                  )}
                  {item.price && (
                    <span className="font-display text-base font-extrabold text-charcoal">
                      {item.price}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Reheating instructions */}
          {activeCategoryData.reheating && (
            <div className="mt-8 p-5 bg-fnc-red/5 border border-fnc-red/10 rounded-2xl flex gap-3">
              <ShieldAlert className="h-5 w-5 text-fnc-red shrink-0 mt-0.5" />
              <div>
                <h4 className="font-body text-xs font-bold uppercase tracking-wider text-fnc-red">
                  Reheating Instructions
                </h4>
                <p className="font-body text-sm text-charcoal/80 mt-1 leading-relaxed">
                  {activeCategoryData.reheating}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Features & CTAs */}
        <div className="flex flex-col gap-6">
          <div className="bg-charcoal text-white rounded-3xl p-6 shadow-sm">
            <h3 className="font-display text-xl font-bold text-white mb-4">
              Our Promise
            </h3>
            <div className="flex flex-col gap-4">
              {menuData.features.map((feat, idx) => (
                <div key={idx} className="flex gap-3">
                  <BadgeCheck className="h-5 w-5 text-fnc-red shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-body text-sm font-semibold text-white">
                      {feat.title}
                    </h4>
                    <p className="font-body text-xs text-white/60">
                      {feat.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-bordergray rounded-3xl p-6 shadow-sm text-center">
            <h3 className="font-display text-lg font-bold text-charcoal mb-2">
              Ready to Order?
            </h3>
            <p className="font-body text-xs text-slate mb-5">
              Order fresh or ready-to-cook items straight to your home.
            </p>
            <Button href="/shop" className="w-full">
              Order Online Now
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
