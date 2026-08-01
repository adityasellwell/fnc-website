import Link from "next/link";
import SignOutButton from "@/components/auth/SignOutButton";
import { Heart, Package, MapPin, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import ProfileForm from "@/components/account/ProfileForm";
import Button from "@/components/ui/Button";
import { getCurrentCustomer } from "@/lib/auth";
import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "My Account",
  description: "Your F&C orders, addresses and wishlist.",
};

const statusLabels = {
  PLACED: "Placed",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  READY_FOR_PICKUP: "Ready for Pickup",
  COLLECTED: "Collected",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
};

const statusTone = {
  DELIVERED: "text-fnc-green bg-fnc-green/10",
  COLLECTED: "text-fnc-green bg-fnc-green/10",
  CANCELLED: "text-fnc-red bg-fnc-red/10",
  REFUNDED: "text-fnc-red bg-fnc-red/10",
};

export default async function AccountPage() {
  const customer = await getCurrentCustomer();

  const [orders, addresses] = customer
    ? await Promise.all([
        db.order.findMany({
          where: { customerId: customer.id },
          include: { items: { include: { product: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        db.address.findMany({ where: { customerId: customer.id }, orderBy: { isDefault: "desc" } }),
      ])
    : [[], []];

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Section background="offwhite" spacing="md">
          <div className="flex items-center justify-between gap-4 mb-8">
            <h1 className="font-display text-section-heading font-bold text-charcoal">
              My Account
            </h1>
            <SignOutButton />
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Order history */}
            <div className="lg:col-span-2 bg-white border border-bordergray rounded-3xl p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-charcoal mb-5 flex items-center gap-2">
                <Package className="h-5 w-5 text-fnc-red" />
                Order History
              </h2>

              {orders.length === 0 ? (
                <div className="flex flex-col items-center text-center gap-3 py-10">
                  <p className="font-body text-sm text-slate">You haven't placed any orders yet.</p>
                  <Button href="/shop" size="md">
                    Browse the Shop
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-bordergray">
                  {orders.map((order) => (
                    <Link
                      key={order.id}
                      href={`/account/orders/${order.id}`}
                      className="py-5 flex flex-col gap-2 hover:bg-warmwhite/50 px-3 rounded-2xl -mx-3 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-body text-sm font-semibold text-charcoal">
                          Order #{order.id.slice(-8)}
                        </p>
                        <span
                          className={cn(
                            "font-body text-xs font-semibold px-2.5 py-1 rounded-full shrink-0",
                            statusTone[order.status] ?? "text-fnc-blue bg-fnc-blue/10"
                          )}
                        >
                          {statusLabels[order.status] ?? order.status}
                        </span>
                      </div>
                      <p className="font-body text-xs text-slate">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}{" "}
                        · {order.items.length} item{order.items.length === 1 ? "" : "s"} ·{" "}
                        {order.fulfillmentType === "DELIVERY" ? "Delivery" : "Pickup"}
                      </p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-display text-sm font-bold text-charcoal">
                          ₹{Number(order.total).toFixed(0)}
                        </p>
                        <span className="font-body text-xs text-fnc-red font-bold flex items-center gap-0.5">
                          Track Order <ChevronRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4">
              <ProfileForm customer={customer} />

              <Link
                href="/wishlist"
                className="flex items-center gap-4 bg-white border border-bordergray rounded-2xl p-5 hover:border-fnc-red transition-colors"
              >
                <div className="h-11 w-11 shrink-0 rounded-full bg-fnc-red/10 flex items-center justify-center">
                  <Heart className="h-5 w-5 text-fnc-red" />
                </div>
                <div className="flex-1">
                  <p className="font-display font-semibold text-charcoal">Your Wishlist</p>
                  <p className="font-body text-xs text-slate">Saved products, ready to order</p>
                </div>
                <ChevronRight className="h-4 w-4 text-slate shrink-0" />
              </Link>

              {/* Saved addresses */}
              <div className="bg-white border border-bordergray rounded-2xl p-5">
                <p className="font-display font-semibold text-charcoal flex items-center gap-2 mb-3">
                  <MapPin className="h-5 w-5 text-fnc-red" />
                  Saved Addresses
                </p>
                {addresses.length === 0 ? (
                  <p className="font-body text-xs text-slate">
                    No saved addresses yet — one gets saved the next time you check out with delivery.
                  </p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {addresses.map((address) => (
                      <div key={address.id} className="font-body text-xs text-slate">
                        {address.line1}
                        {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state}{" "}
                        {address.pincode}
                        {address.isDefault && (
                          <span className="ml-1.5 text-fnc-green font-semibold">(Default)</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
