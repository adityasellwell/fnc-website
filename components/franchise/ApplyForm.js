"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, XCircle, ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button";

const initialValues = {
  name: "",
  email: "",
  phone: "",
  city: "",
  investmentBudget: "",
  message: "",
};

const budgetOptions = [
  "Under ₹25 Lakhs",
  "₹25 – 50 Lakhs",
  "₹50 Lakhs – 1 Crore",
  "Above ₹1 Crore",
];

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Please enter your full name.";
  if (!values.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!values.phone.trim()) {
    errors.phone = "Please enter your phone number.";
  } else if (!/^[\d+\s-]{7,15}$/.test(values.phone.trim())) {
    errors.phone = "Please enter a valid phone number.";
  }
  if (!values.city.trim()) errors.city = "Please enter your city.";
  if (!values.investmentBudget) errors.investmentBudget = "Please select an investment range.";
  return errors;
}

const inputClasses =
  "w-full h-12 px-4 rounded-xl border border-bordergray bg-white font-body text-base text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors";

export default function ApplyForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error
  const [serverError, setServerError] = useState("");

  function handleChange(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    setServerError("");
    try {
      const res = await fetch("/api/franchise-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phone: values.phone,
          city: values.city,
          investmentBudget: values.investmentBudget,
          message: values.message,
        }),
      });

      if (!res.ok) {
        throw new Error("Request failed");
      }

      setStatus("success");
      setValues(initialValues);
    } catch {
      setStatus("error");
      setServerError(
        "We couldn't submit your application right now. Please try again shortly."
      );
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center gap-3 bg-fnc-green/5 border border-fnc-green/20 rounded-2xl p-10">
        <CheckCircle2 className="h-12 w-12 text-fnc-green" />
        <h3 className="font-display text-xl font-bold text-charcoal">
          Application received
        </h3>
        <p className="font-body text-sm text-slate max-w-sm">
          Thanks for your interest in franchising with F&amp;C. Our franchise
          team will review your details and reach out within a few business
          days.
        </p>
        <Button variant="outline" size="sm" onClick={() => setStatus("idle")}>
          Submit another application
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="font-body text-sm font-semibold text-charcoal">
            Full name
          </label>
          <input
            id="name"
            type="text"
            value={values.name}
            onChange={handleChange("name")}
            placeholder="Your full name"
            className={inputClasses}
          />
          {errors.name && <p className="font-body text-xs text-fnc-red">{errors.name}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="font-body text-sm font-semibold text-charcoal">
            Phone number
          </label>
          <input
            id="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange("phone")}
            placeholder="+91 98765 43210"
            className={inputClasses}
          />
          {errors.phone && <p className="font-body text-xs text-fnc-red">{errors.phone}</p>}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="font-body text-sm font-semibold text-charcoal">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={values.email}
            onChange={handleChange("email")}
            placeholder="you@example.com"
            className={inputClasses}
          />
          {errors.email && <p className="font-body text-xs text-fnc-red">{errors.email}</p>}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="city" className="font-body text-sm font-semibold text-charcoal">
            City you&apos;re interested in
          </label>
          <input
            id="city"
            type="text"
            value={values.city}
            onChange={handleChange("city")}
            placeholder="e.g. Bengaluru"
            className={inputClasses}
          />
          {errors.city && <p className="font-body text-xs text-fnc-red">{errors.city}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="investmentBudget" className="font-body text-sm font-semibold text-charcoal">
          Investment budget
        </label>
        <div className="relative">
          <select
            id="investmentBudget"
            value={values.investmentBudget}
            onChange={handleChange("investmentBudget")}
            className={`${inputClasses} appearance-none pr-10`}
          >
            <option value="">Select a range</option>
            {budgetOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <ChevronDown className="h-4 w-4 text-slate absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
        {errors.investmentBudget && (
          <p className="font-body text-xs text-fnc-red">{errors.investmentBudget}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="font-body text-sm font-semibold text-charcoal">
          Tell us about yourself (optional)
        </label>
        <textarea
          id="message"
          rows={4}
          value={values.message}
          onChange={handleChange("message")}
          placeholder="Your background, why F&C, timeline, etc."
          className="w-full px-4 py-3 rounded-xl border border-bordergray bg-white font-body text-base text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors resize-none"
        />
      </div>

      {status === "error" && (
        <p className="font-body text-sm text-fnc-red flex items-center gap-2">
          <XCircle className="h-4 w-4 shrink-0" />
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        size="lg"
        disabled={status === "submitting"}
        className="w-full sm:w-fit"
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Application"
        )}
      </Button>
    </form>
  );
}
