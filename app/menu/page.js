import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Container from "@/components/layout/Container";
import MenuClient from "./MenuClient";

export const metadata = {
  title: "Our Dine-In & Takeaway Menu — F&C Fresh Proteins & More",
  description:
    "Explore our delicious ready-to-eat wraps, sandwiches, hot sausages, seekh kebabs, biryanis, and premium combo packs. Available for order online or store pickup.",
};

const MENU_DATA = {
  categories: [
    {
      id: "snacks",
      name: "Classic Chicken Snacks",
      subtitle: "Try our range of healthy, delicious, and affordable chicken snacks.",
      startingPrice: "Starting at ₹255",
      reheating: "Preheat oven/pan for 5 mins without food on medium flame. Place the frozen/thawed product and heat on low flame for 7-8 mins. Turn sides in between. Alternatively, heat in a microwave for 2-3 mins.",
      items: [
        { name: "Chicken Cheese Torpedos", detail: "7-8 Pcs" },
        { name: "Cheesy Herb Roast (With Bone)", detail: "7-8 Pcs" },
        { name: "Farcha Chicken Drumsticks", detail: "7-8 Pcs" },
        { name: "Hot & Spicy Drumsticks", detail: "4-6 Pcs", spicy: true },
        { name: "Sweet & Smoky Korean Wings", detail: "4-5 Pcs", spicy: true },
        { name: "Southern Fried Crispy Wings", detail: "6-8 Pcs" },
        { name: "Jumbo Chicken Nuggets", detail: "5-6 Pcs" },
        { name: "Railway Chicken Cutlets", detail: "4-6 Pcs" },
        { name: "Persian Chicken Cutlets", detail: "2-3 Pcs" },
        { name: "Grill It New York Burger Patty", detail: "2-3 Pcs" },
        { name: "Bhuna Masala Kheema", detail: "Serves 1-2" },
        { name: "Grilled Seekh Kebab", detail: "4-6 Pcs" },
        { name: "Classic Seekh Kebab", detail: "4-6 Pcs" },
        { name: "Angara Seekh Kebab", detail: "4-6 Pcs" }
      ]
    },
    {
      id: "wraps",
      name: "Wraps, Sandwiches & Meal Boxes",
      subtitle: "Looking for a healthy, convenient, and well-packed meal solution? Search no more, come home to HRC.",
      items: [
        { name: "Classic Club Sandwich", price: "₹210" },
        { name: "Tandoori Club Sandwich", price: "₹210" },
        { name: "Lebanese Chicken Wrap", price: "₹220" },
        { name: "Bhuna Chicken Wrap", price: "₹220" },
        { name: "Chicken Tikka Roll", price: "₹220" },
        { name: "Arabic Chicken Pilaf / Pulao Meal Box", price: "₹210" },
        { name: "Grilled Chicken & Veggies Meal Box", price: "₹300" }
      ]
    },
    {
      id: "sausages",
      name: "Chicken Sausages & Salamis",
      subtitle: "Explore our wholesome range of high-protein sausages & salamis.",
      startingPrice: "Starting at ₹220",
      reheating: "Pan fry for 3-4 mins or microwave for 1-2 mins or air fry for 3-4 mins.",
      items: [
        { name: "Cocktail Sausages", detail: "12-14 Pcs" },
        { name: "Classic Sausages", detail: "8-10 Pcs" },
        { name: "Chilli Cheese Sausages", detail: "10-12 Pcs" },
        { name: "Cheese & Onion Sausages", detail: "10-12 Pcs" },
        { name: "Smoked Chicken Hot Dog Sausages", detail: "4-5 Pcs" },
        { name: "Cocktail Salamis", detail: "22-25 Slices" },
        { name: "Smoked Chicken Ham Slices", detail: "10-20 Slices" },
        { name: "Classic Salamis", detail: "22-25 Slices" }
      ]
    },
    {
      id: "salads",
      name: "Chicken Loaded Salads",
      subtitle: "Salads don't have to be boring. Let us surprise you with ours.",
      startingPrice: "Starting at ₹255",
      badge: "60% Chicken · 20% Veggies",
      items: [
        { name: "Classic Salad" },
        { name: "Bistro Salad" },
        { name: "Tandoori Salad" }
      ]
    },
    {
      id: "biryani",
      name: "Shahi Biryani",
      subtitle: "Traditionally aromatic recipes made to perfection.",
      reheating: "Microwave for 2-3 mins or place the pack in boiling water for 8-10 mins. Alternatively, heat in a pan for 5-6 mins.",
      items: [
        { name: "Chicken Dum Biryani (Boneless)", price: "₹279" },
        { name: "Chicken Hyderabadi Biryani (Boneless)", price: "₹279" },
        { name: "Chicken Tikka Biryani (Boneless)", price: "₹279" }
      ]
    },
    {
      id: "pav",
      name: "Chicken Pav Wow",
      subtitle: "Experience the combination of our signature chicken tikka / kheema with a delicious home-style bun (pav).",
      badge: "Add-ons: Habanero Chutney (+₹15), Cheese Slice (+₹15)",
      items: [
        { name: "Chicken Vada Pav", price: "₹90" },
        { name: "Chicken Seekh Pav", price: "₹110" },
        { name: "Desi Chicken Burger", price: "₹110" },
        { name: "Chicken Kheema Pav", price: "₹110" }
      ]
    },
    {
      id: "pocket",
      name: "Pocket Heroes",
      subtitle: "Delicious chicken eats that fit your life and pocket, perfect for anytime hunger!",
      startingPrice: "₹75 per pc / ₹110 Only",
      items: [
        { name: "Grilled Chicken Burger" },
        { name: "Chicken Shawarma Roll" },
        { name: "Multigrain Chicken Wrap" },
        { name: "Classic Chicken Sandwich" }
      ]
    },
    {
      id: "combos",
      name: "Combos & Bulk Savings",
      subtitle: "Pick any 4 products weighing 250 gms each from the categories below and save more. Buy More Save More!",
      items: [
        { name: "Classic Chicken Snacks & Seekh Combo", originalPrice: "₹1020", price: "₹800*" },
        { name: "Marinated Chicken Combo", originalPrice: "₹940", price: "₹770*" },
        { name: "Chicken Sausages & Salamis Combo", originalPrice: "₹880", price: "₹750*" }
      ]
    },
    {
      id: "dips",
      name: "Add-ons & Dips",
      subtitle: "Elevate your snacks with our signature dips.",
      startingPrice: "₹20 each",
      items: [
        { name: "Cheesy Schezwan" },
        { name: "Garlic Mayo" },
        { name: "Mint Chutney" },
        { name: "Schezwan Sauce" }
      ]
    }
  ],
  features: [
    { title: "High Protein", desc: "Clean & lean nutrition source" },
    { title: "Fresh Not Frozen", desc: "Hygienically sourced & prepared daily" },
    { title: "Preservative Free", desc: "No artificial chemicals or additives" },
    { title: "Olive Oil Goodness", desc: "Prepared with heart-healthy oils" },
    { title: "Free Home Delivery", desc: "Order on Swiggy or Zomato" }
  ]
};

export default function MenuPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 bg-offwhite min-h-screen">
        {/* Banner Section */}
        <div className="bg-charcoal text-white py-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-radial-gradient from-charcoal/40 to-charcoal pointer-events-none" />
          <Container className="relative z-10">
            <span className="inline-block text-xs font-bold uppercase tracking-wider text-fnc-red mb-3 px-3 py-1 bg-fnc-red/10 border border-fnc-red/20 rounded-full">
              Dine-In · Takeaway · Online
            </span>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3">
              F&C Fresh Menu
            </h1>
            <p className="font-body text-slate max-w-2xl mx-auto text-base sm:text-lg">
              Freshly prepared chicken snacks, loaded salads, wraps, rolls, and shahi biryani cooked fresh daily at our store.
            </p>
          </Container>
        </div>

        {/* Client Interactive Area */}
        <Container className="py-12">
          <MenuClient menuData={MENU_DATA} />
        </Container>
      </main>
      <Footer />
    </>
  );
}
