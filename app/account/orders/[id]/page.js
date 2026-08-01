import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, MapPin, Phone, ShieldCheck, ShoppingBag, Truck, User } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Section from "@/components/layout/Section";
import Container from "@/components/layout/Container";
import Card from "@/components/ui/Card";
import { getCurrentCustomer } from "@/lib/auth";
import { getOrderById } from "@/services/orders";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Track Order — F&C",
};

const statusLabels = {
  PLACED: "Order Placed",
  CONFIRMED: "Order Confirmed",
  PREPARING: "Preparing Items",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  READY_FOR_PICKUP: "Ready for Pickup",
  COLLECTED: "Collected & Completed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
  RETURNED: "Returned",
};

const statusDescriptions = {
  PLACED: "We have received your order and are confirming it shortly.",
  CONFIRMED: "Your order is confirmed and will be processed soon.",
  PREPARING: "Our team is fresh-packing your selected proteins.",
  OUT_FOR_DELIVERY: "Your package is on its way to your delivery address.",
  DELIVERED: "Delivered! Thank you for choosing F&C.",
  READY_FOR_PICKUP: "Your order is ready to be collected at the selected store.",
  COLLECTED: "Collected! Thank you for shopping with F&C.",
  CANCELLED: "This order has been cancelled.",
  REFUNDED: "The amount has been refunded back to your account.",
  RETURNED: "Returned. Your items have been sent back to the store.",
};

export default async function TrackOrderPage({ params }) {
  const { id } = await params;
  const customer = await getCurrentCustomer();

  if (!customer) {
    redirect(`/sign-in?redirect=/account/orders/${id}`);
  }

  const order = await getOrderById(id);

  if (!order || order.customerId !== customer.id) {
    notFound();
  }

  // Parse delivery address if delivery
  let deliveryAddress = null;
  if (order.fulfillmentType === "DELIVERY" && order.deliveryAddress) {
    try {
      deliveryAddress = typeof order.deliveryAddress === "string"
        ? JSON.parse(order.deliveryAddress)
        : order.deliveryAddress;
    } catch (e) {
      console.error("Failed to parse delivery address:", e);
    }
  }

  const isCancelledOrRefunded = ["CANCELLED", "REFUNDED", "RETURNED"].includes(order.status);

  // Define steps for progress bar
  const deliverySteps = ["PLACED", "CONFIRMED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];
  const pickupSteps = ["PLACED", "CONFIRMED", "PREPARING", "READY_FOR_PICKUP", "COLLECTED"];
  const steps = order.fulfillmentType === "DELIVERY" ? deliverySteps : pickupSteps;

  const currentStepIndex = steps.indexOf(order.status);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-offwhite min-h-screen">
        <div className="border-b border-bordergray bg-white py-4">
          <Container>
            <Link
              href="/account"
              className="inline-flex items-center gap-2 font-body text-sm font-semibold text-slate hover:text-fnc-red transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to My Account
            </Link>
          </Container>
        </div>

        <Section background="offwhite" spacing="md">
          <div className="max-w-4xl mx-auto flex flex-col gap-6">
            {/* Header Card */}
            <Card className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between gap-4">
              <div>
                <p className="font-body text-xs font-semibold uppercase tracking-wider text-slate">
                  Fulfillment: {order.fulfillmentType === "DELIVERY" ? "Delivery" : "Store Pickup"}
                </p>
                <h1 className="font-display text-2xl font-bold text-charcoal mt-1">
                  Order #{order.id.slice(-8)}
                </h1>
                <p className="font-body text-sm text-slate mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div className="flex flex-col sm:items-end justify-center">
                <span className="font-body text-xs text-slate">Payment Status</span>
                <span className={cn(
                  "font-body text-sm font-bold uppercase mt-1 px-3 py-1 rounded-full text-center w-fit",
                  order.paymentStatus === "PAID"
                    ? "text-fnc-green bg-fnc-green/10"
                    : order.paymentStatus === "REFUNDED"
                    ? "text-fnc-red bg-fnc-red/10"
                    : "text-amber-600 bg-amber-50"
                )}>
                  {order.paymentStatus}
                </span>
              </div>
            </Card>

            {/* Tracking Status Card */}
            <Card className="p-6 sm:p-8">
              <h2 className="font-display text-lg font-bold text-charcoal mb-6">
                Delivery Tracker
              </h2>

              {isCancelledOrRefunded ? (
                <div className="p-6 bg-fnc-red/5 border border-fnc-red/20 rounded-2xl flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-fnc-red/10 flex items-center justify-center text-fnc-red shrink-0">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-charcoal text-base">
                      {statusLabels[order.status]}
                    </h3>
                    <p className="font-body text-sm text-slate mt-1">
                      {statusDescriptions[order.status]}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 relative pt-4">
                  {/* Progress Line */}
                  <div className="hidden md:block absolute left-0 right-0 top-1/2 h-1 bg-bordergray -translate-y-4 -mx-4 z-0" />
                  {/* Completed Progress Line */}
                  {currentStepIndex > 0 && (
                    <div
                      className="hidden md:block absolute left-0 top-1/2 h-1 bg-fnc-green -translate-y-4 -mx-4 z-0 transition-all duration-500"
                      style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                    />
                  )}

                  {steps.map((step, idx) => {
                    const isCompleted = idx <= currentStepIndex;
                    const isActive = idx === currentStepIndex;

                    return (
                      <div key={step} className="flex md:flex-col items-center gap-4 md:gap-2 flex-1 w-full z-10">
                        {/* Circle Badge */}
                        <div className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center font-display text-sm font-bold border-2 transition-all",
                          isCompleted
                            ? "bg-fnc-green border-fnc-green text-white shadow-md shadow-fnc-green/10"
                            : "bg-white border-bordergray text-slate"
                        )}>
                          {isCompleted ? "✓" : idx + 1}
                        </div>

                        {/* Labels */}
                        <div className="flex flex-col md:items-center text-left md:text-center">
                          <p className={cn(
                            "font-display text-sm font-semibold transition-colors",
                            isActive ? "text-fnc-red" : isCompleted ? "text-charcoal" : "text-slate"
                          )}>
                            {statusLabels[step]}
                          </p>
                          {isActive && (
                            <p className="font-body text-xs text-slate md:max-w-36 mt-0.5">
                              {statusDescriptions[step]}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Order Items */}
              <Card className="p-6">
                <h2 className="font-display text-lg font-bold text-charcoal mb-4 flex items-center gap-2 border-b border-bordergray pb-3">
                  <ShoppingBag className="h-5 w-5 text-fnc-red" />
                  Items Ordered
                </h2>
                <div className="flex flex-col divide-y divide-bordergray">
                  {order.items.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between gap-3 text-sm">
                      <div className="min-w-0">
                        <p className="font-display font-semibold text-charcoal truncate">
                          {item.product?.name}
                        </p>
                        <p className="font-body text-xs text-slate">
                          {item.product?.unit || "Unit"} x {item.quantity}
                        </p>
                      </div>
                      <span className="font-body font-semibold text-charcoal shrink-0">
                        ₹{(Number(item.unitPrice) * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-bordergray flex flex-col gap-2 font-body text-sm">
                  <div className="flex justify-between font-display font-bold text-base text-charcoal pt-2">
                    <span>Total paid</span>
                    <span>₹{Number(order.total).toFixed(0)}</span>
                  </div>
                </div>
              </Card>

              {/* Delivery Details & Rider Details */}
              <div className="flex flex-col gap-6">
                {/* Fulfillment card */}
                <Card className="p-6">
                  {order.fulfillmentType === "DELIVERY" ? (
                    <>
                      <h2 className="font-display text-lg font-bold text-charcoal mb-4 flex items-center gap-2 border-b border-bordergray pb-3">
                        <Truck className="h-5 w-5 text-fnc-red" />
                        Delivery Details
                      </h2>
                      {deliveryAddress ? (
                        <div className="font-body text-sm text-charcoal leading-relaxed">
                          <p className="font-semibold">{order.customer.name}</p>
                          <p className="text-slate mt-1">
                            {deliveryAddress.line1}
                            {deliveryAddress.line2 ? `, ${deliveryAddress.line2}` : ""}
                          </p>
                          <p className="text-slate">
                            {deliveryAddress.city}, {deliveryAddress.state} {deliveryAddress.pincode}
                          </p>
                          <p className="text-slate mt-2 flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            {order.customer.phone || "No phone linked"}
                          </p>
                        </div>
                      ) : (
                        <p className="font-body text-sm text-slate">No delivery address saved.</p>
                      )}
                    </>
                  ) : (
                    <>
                      <h2 className="font-display text-lg font-bold text-charcoal mb-4 flex items-center gap-2 border-b border-bordergray pb-3">
                        <MapPin className="h-5 w-5 text-fnc-red" />
                        Pickup Store
                      </h2>
                      {order.store ? (
                        <div className="font-body text-sm text-charcoal leading-relaxed">
                          <p className="font-semibold">{order.store.name}</p>
                          <p className="text-slate mt-1">{order.store.address}</p>
                          <p className="text-slate">{order.store.city}, {order.store.state}</p>
                          <p className="text-slate mt-2 flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5" />
                            {order.store.phone}
                          </p>
                        </div>
                      ) : (
                        <p className="font-body text-sm text-slate">No pickup store selected.</p>
                      )}
                    </>
                  )}
                </Card>

                {/* Rider assignment card */}
                {order.fulfillmentType === "DELIVERY" && (order.riderName || order.riderPhone) && (
                  <Card className="p-6 bg-warmwhite/30 border-2 border-fnc-red/10">
                    <h2 className="font-display text-base font-bold text-charcoal mb-3 flex items-center gap-2">
                      <User className="h-4.5 w-4.5 text-fnc-red" />
                      Rider Information
                    </h2>
                    <div className="font-body text-sm text-charcoal">
                      <p className="font-semibold">{order.riderName || "Delivery Partner Assigned"}</p>
                      {order.riderPhone && (
                        <p className="text-slate mt-1.5 flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-fnc-red" />
                          <a href={`tel:${order.riderPhone}`} className="text-fnc-red font-bold hover:underline">
                            {order.riderPhone}
                          </a>
                        </p>
                      )}
                    </div>
                  </Card>
                )}

                {/* Help Card */}
                <Card className="p-6 flex items-start gap-4 bg-fnc-green/5 border border-fnc-green/10">
                  <ShieldCheck className="h-8 w-8 text-fnc-green shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-display font-bold text-charcoal text-sm">Need help?</h3>
                    <p className="font-body text-xs text-slate mt-1 leading-relaxed">
                      If you have questions about your order or need delivery support, please contact our support team or WhatsApp us.
                    </p>
                    <Link
                      href="/contact"
                      className="inline-block mt-3 text-xs font-bold text-fnc-red hover:underline"
                    >
                      Contact Support
                    </Link>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
