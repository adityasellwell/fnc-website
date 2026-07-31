"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { submitContactMessageAction } from "@/app/contact/actions";

const initialValues = { name: "", email: "", phone: "", message: "" };

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!values.email.trim()) {
    errors.email = "Please enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!values.message.trim()) errors.message = "Please add a short message.";
  return errors;
}

const inputClasses =
  "w-full h-12 px-4 rounded-xl border border-bordergray bg-white font-body text-base text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors";

export default function ContactForm() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | submitting | success | error

  function handleChange(field) {
    return (e) => setValues((v) => ({ ...v, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    try {
      const result = await submitContactMessageAction(values);
      if (!result.ok) throw new Error(result.error);
      setStatus("success");
      setValues(initialValues);
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center text-center gap-3 bg-fnc-green/5 border border-fnc-green/20 rounded-2xl p-8">
        <CheckCircle2 className="h-10 w-10 text-fnc-green" />
        <h3 className="font-display text-lg font-bold text-charcoal">
          Message received
        </h3>
        <p className="font-body text-sm text-slate max-w-xs">
          Thanks for reaching out — our team will get back to you shortly.
        </p>
        <Button variant="outline" size="sm" onClick={() => setStatus("idle")}>
          Send another message
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
            placeholder="Your name"
            className={inputClasses}
          />
          {errors.name && (
            <p className="font-body text-xs text-fnc-red">{errors.name}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="phone" className="font-body text-sm font-semibold text-charcoal">
            Phone (optional)
          </label>
          <input
            id="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange("phone")}
            placeholder="+91 98765 43210"
            className={inputClasses}
          />
        </div>
      </div>

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
        {errors.email && (
          <p className="font-body text-xs text-fnc-red">{errors.email}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="font-body text-sm font-semibold text-charcoal">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          value={values.message}
          onChange={handleChange("message")}
          placeholder="How can we help?"
          className="w-full px-4 py-3 rounded-xl border border-bordergray bg-white font-body text-base text-charcoal placeholder:text-slate focus:border-fnc-red focus:outline-none transition-colors resize-none"
        />
        {errors.message && (
          <p className="font-body text-xs text-fnc-red">{errors.message}</p>
        )}
      </div>

      {status === "error" && (
        <p className="font-body text-sm text-fnc-red">
          Something went wrong. Please try again in a moment.
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
            Sending...
          </>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  );
}
