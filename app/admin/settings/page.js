import { getSettings } from "@/services/settings";
import { updateSettingsAction } from "./actions";
import { requireFullAdminUser } from "@/lib/admin-auth";

export const metadata = { title: "Settings — Admin" };

const inputClasses =
  "w-full h-11 px-3.5 rounded-xl border border-bordergray bg-white font-body text-sm text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors";

export default async function AdminSettingsPage() {
  await requireFullAdminUser();
  const settings = await getSettings();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-charcoal mb-6">Settings</h1>

      <form action={updateSettingsAction} className="bg-white border border-bordergray rounded-3xl p-6 flex flex-col gap-6">
        <h2 className="font-display text-lg font-bold text-charcoal border-b border-bordergray pb-3">Delivery &amp; Checkout Rules</h2>

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

        <h2 className="font-display text-lg font-bold text-charcoal border-b border-bordergray pb-3 mt-4">Platform Listing Integrations</h2>

        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs font-semibold text-charcoal">Zomato Listing URL (optional)</label>
          <input
            name="zomatoUrl"
            type="url"
            placeholder="https://www.zomato.com/..."
            defaultValue={settings.zomatoUrl || ""}
            className={inputClasses}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="font-body text-xs font-semibold text-charcoal">Swiggy Listing URL (optional)</label>
          <input
            name="swiggyUrl"
            type="url"
            placeholder="https://www.swiggy.com/..."
            defaultValue={settings.swiggyUrl || ""}
            className={inputClasses}
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-bordergray">
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
