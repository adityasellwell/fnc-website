import { Truck, Phone, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { getSettings } from "@/services/settings";
import { updateSettingsAction } from "./actions";
import { requireFullAdminUser } from "@/lib/admin-auth";
import { WHY_CHOOSE_POINTS } from "@/lib/constants";
import ImageUploadField from "@/components/admin/ImageUploadField";
import VideoUploadField from "@/components/admin/VideoUploadField";

export const metadata = { title: "Settings — Admin" };

const inputClasses =
  "w-full h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors";

function SectionCard({ icon: Icon, title, description, children }) {
  return (
    <div className="bg-white border border-bordergray rounded-3xl p-6 flex flex-col gap-5">
      <div className="flex items-start gap-3 pb-4 border-b border-bordergray">
        <span className="h-9 w-9 rounded-xl bg-fnc-red/10 text-fnc-red flex items-center justify-center shrink-0">
          <Icon className="h-4.5 w-4.5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold text-charcoal">{title}</h2>
          {description && <p className="font-body text-xs text-slate mt-0.5">{description}</p>}
        </div>
      </div>
      {children}
    </div>
  );
}

export default async function AdminSettingsPage() {
  await requireFullAdminUser();
  const settings = await getSettings();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-charcoal mb-6">Settings</h1>

      <form action={updateSettingsAction} className="flex flex-col gap-5">
        <SectionCard icon={Truck} title="Delivery & Checkout Rules">
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Delivery Radius (km)</label>
              <input
                name="deliveryRadiusKm"
                type="number"
                step="0.1"
                defaultValue={settings.deliveryRadiusKm}
                required
                className={inputClasses}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Delivery Charge (₹)</label>
              <input
                name="deliveryCharge"
                type="number"
                step="0.01"
                defaultValue={Number(settings.deliveryCharge)}
                required
                className={inputClasses}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Minimum Order Value (₹)</label>
              <input
                name="minOrderValue"
                type="number"
                step="0.01"
                defaultValue={Number(settings.minOrderValue)}
                required
                className={inputClasses}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Free Delivery Threshold (₹)</label>
              <input
                name="freeDeliveryThreshold"
                type="number"
                step="0.01"
                defaultValue={Number(settings.freeDeliveryThreshold)}
                required
                className={inputClasses}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={Phone}
          title="Business Contact Details"
          description="Shown site-wide in the footer and on the Contact page. Leave blank to keep the current default."
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Phone</label>
              <input name="businessPhone" defaultValue={settings.businessInfo?.phone || ""} placeholder="+91 70392 22266" className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">WhatsApp Number</label>
              <input name="businessWhatsapp" defaultValue={settings.businessInfo?.whatsapp || ""} placeholder="+91 70392 22266" className={inputClasses} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Email</label>
              <input name="businessEmail" type="email" defaultValue={settings.businessInfo?.email || ""} placeholder="anchospitalityllp@gmail.com" className={inputClasses} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-body text-xs font-semibold text-charcoal">Instagram URL</label>
              <input name="socialInstagram" defaultValue={settings.socialLinks?.instagram || "https://www.instagram.com/fishchickencrab/"} placeholder="https://www.instagram.com/fishchickencrab/" className={inputClasses} />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={ImageIcon}
          title="Homepage & Franchise Images"
          description={'Optional — each "Why Choose F&C" card and the Franchise page hero show an icon-only look until an image is set here. Leave any of these blank to keep that default look.'}
        >
          <div className="grid sm:grid-cols-2 gap-5">
            {WHY_CHOOSE_POINTS.map((point) => (
              <ImageUploadField
                key={point.title}
                name={`whyCardImage__${point.title}`}
                label={point.title}
                defaultValue={settings.whyChooseCardImages?.[point.title] || ""}
                folder="homepage"
              />
            ))}
          </div>

          <ImageUploadField
            name="franchiseHeroImage"
            label="Franchise Page Hero Image"
            defaultValue={settings.franchiseHeroImage || ""}
            folder="franchise"
          />
        </SectionCard>

        <SectionCard
          icon={VideoIcon}
          title="Homepage Story Video"
          description="Shown as its own section below the category circles on the homepage. One video + one poster image — leave both empty to hide the section."
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <VideoUploadField
              name="homepageVideoUrl"
              label="Video"
              defaultValue={settings.homepageVideoUrl || ""}
              folder="homepage"
            />
            <ImageUploadField
              name="homepageVideoPoster"
              label="Poster Image (shown before play)"
              defaultValue={settings.homepageVideoPoster || ""}
              folder="homepage"
            />
          </div>
        </SectionCard>

        <div className="flex justify-end">
          <button
            type="submit"
            className="h-11 px-6 rounded-xl bg-fnc-red text-white font-body text-sm font-semibold hover:bg-fnc-red/90 transition-colors cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
