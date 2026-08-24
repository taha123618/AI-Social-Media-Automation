"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useActionState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  Building2,
  Users,
  Briefcase,
  Phone,
  Globe,
  Target,
  MessageSquare,
  ArrowRight,
  Mail,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TEAM_SIZES,
  USE_CASES,
  TIME_SLOTS,
  COUNTRIES,
  initialState,
  type FormState,
} from "../schema/form.schema";
import { submitDemoAction } from "../actions/form-submission.action";
import Link from "next/link";

const INPUT_BASE = "h-12 rounded-xl border-border bg-background font-medium focus-visible:ring-primary/30 text-foreground";
const SELECT_TRIGGER_BASE = "h-12 rounded-xl border-border bg-background font-medium focus-visible:ring-primary/30 text-foreground";
const LABEL_BASE = "text-sm font-semibold text-foreground";
const ICON_BASE = "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none";
const ICON_CLASS = "absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10";
const ERR_MSG = "text-xs font-medium text-destructive mt-1";
const DEFAULT_COUNTRY = COUNTRIES[0].value;

function getTodayString() {
  return new Date().toISOString().split("T")[0];
}

function getMaxDateString() {
  const max = new Date();
  max.setMonth(max.getMonth() + 3);
  return max.toISOString().split("T")[0];
}

function FieldError({ error, id }: { error?: string; id?: string }) {
  return error ? <p id={id} className={ERR_MSG} role="alert">{error}</p> : null;
}

function DemoFormInner({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    submitDemoAction,
    initialState,
  );
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [clearedFields, setClearedFields] = useState<string[]>([]);
  const errorRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const focusedRef = useRef(false);
  const [formLoadedAt] = useState(() => Date.now().toString());

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [phone, setPhone] = useState("");
  const [manualCountry, setManualCountry] = useState<string | null>(null);
  const [useCase, setUseCase] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [notes, setNotes] = useState("");

  const visitorCountryQuery = useQuery<string | null>({
    queryKey: ["talk-to-sales", "visitorCountry"],
    queryFn: async () => {
      const { data } = await axios.get<{ countryCode?: string }>("/api/talk-to-sales/geoip", {
        headers: { Accept: "application/json" },
      });
      return data.countryCode ?? null;
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const visitorCountry = useMemo(() => {
    if (!visitorCountryQuery.isSuccess) {
      return DEFAULT_COUNTRY;
    }

    return typeof visitorCountryQuery.data === "string"
      ? visitorCountryQuery.data
      : DEFAULT_COUNTRY;
  }, [visitorCountryQuery.data, visitorCountryQuery.isSuccess]);

  const country = manualCountry ?? visitorCountry;

  const countryStatus = useMemo(() => {
    if (visitorCountryQuery.isLoading) {
      return "Detecting country from your location...";
    }
    if (visitorCountryQuery.isError) {
      return "Could not detect your country. Please update if needed.";
    }
    const visitorCode = visitorCountryQuery.data;
    const isSupported = visitorCode ? COUNTRIES.some((c) => c.value === visitorCode) : false;
    return isSupported
      ? "Country auto-detected from your location. You can still change it."
      : "Could not detect your exact country. Please update if needed.";
  }, [visitorCountryQuery.data, visitorCountryQuery.isError, visitorCountryQuery.isLoading]);

  useEffect(() => {
    if (state.status === "success") {
      onSuccess();
    }
  }, [state, onSuccess]);

  const fieldErrors = useMemo(() => {
    const result: Record<string, string> = {};
    if (hasSubmitted && state.status === "error" && state.errors) {
      for (const [key, val] of Object.entries(state.errors)) {
        if (!clearedFields.includes(key)) {
          result[key] = val as string;
        }
      }
    }
    return result;
  }, [hasSubmitted, state, clearedFields]);

  const showErrors = hasSubmitted && state.status === "error";

  useEffect(() => {
    if (showErrors && !focusedRef.current) {
      focusedRef.current = true;
      errorRef.current?.focus();
    }
    if (!showErrors) {
      focusedRef.current = false;
    }
  }, [showErrors]);

  function clearFieldError(name: string) {
    setClearedFields((prev) => prev.includes(name) ? prev : [...prev, name]);
  }

  function handleFormAction(formData: FormData) {
    setHasSubmitted(true);
    setClearedFields([]);
    focusedRef.current = false;
    formAction(formData);
  }

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Calendar className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-black text-foreground">Book Your Demo</h3>
          <p className="text-sm text-muted-foreground">All fields marked * are required</p>
        </div>
      </div>

      {showErrors && (
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
        >
          {state.message}
        </div>
      )}

      <form
        ref={formRef}
        action={handleFormAction}
        className="space-y-6"
        noValidate
      >
        <input type="hidden" name="formLoadedAt" value={formLoadedAt} />
        <input type="hidden" name="website" value="" aria-hidden="true" tabIndex={-1} autoComplete="off" style={{ position: "absolute", left: "-9999px" }} />
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={LABEL_BASE} htmlFor="firstName">First Name *</label>
            <div className="relative">
              <User className={ICON_BASE} />
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                value={firstName}
                className={`${INPUT_BASE} pl-11`}
                disabled={isPending}
                autoComplete="given-name"
                aria-required="true"
                aria-invalid={!!fieldErrors.firstName}
                aria-describedby={fieldErrors.firstName ? "err-firstName" : undefined}
                onChange={(e) => { setFirstName(e.target.value); clearFieldError("firstName"); }}
              />
            </div>
            <FieldError error={fieldErrors.firstName} id="err-firstName" />
          </div>
          <div className="space-y-2">
            <label className={LABEL_BASE} htmlFor="lastName">Last Name *</label>
            <div className="relative">
              <User className={ICON_BASE} />
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                value={lastName}
                className={`${INPUT_BASE} pl-11`}
                disabled={isPending}
                autoComplete="family-name"
                aria-required="true"
                aria-invalid={!!fieldErrors.lastName}
                onChange={(e) => { setLastName(e.target.value); clearFieldError("lastName"); }}
              />
            </div>
            <FieldError error={fieldErrors.lastName} id="err-lastName" />
          </div>
        </div>

        <div className="space-y-2">
          <label className={LABEL_BASE} htmlFor="email">Work Email *</label>
          <div className="relative">
            <Mail className={ICON_BASE} />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="john@company.com"
              value={email}
              className={`${INPUT_BASE} pl-11`}
              disabled={isPending}
              autoComplete="email"
              aria-required="true"
              aria-invalid={!!fieldErrors.email}
              onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
            />
          </div>
          <FieldError error={fieldErrors.email} id="err-email" />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={LABEL_BASE} htmlFor="company">Company Name *</label>
            <div className="relative">
              <Building2 className={ICON_BASE} />
              <Input
                id="company"
                name="company"
                placeholder="Acme Inc."
                value={company}
                className={`${INPUT_BASE} pl-11`}
                disabled={isPending}
                autoComplete="organization"
                aria-required="true"
                aria-invalid={!!fieldErrors.company}
                onChange={(e) => { setCompany(e.target.value); clearFieldError("company"); }}
              />
            </div>
            <FieldError error={fieldErrors.company} id="err-company" />
          </div>
          <div className="space-y-2">
            <label className={LABEL_BASE} htmlFor="teamSize">Team Size *</label>
            <div className="relative">
              <Users className={ICON_CLASS} />
              <input type="hidden" name="teamSize" value={teamSize} />
              <Select
                value={teamSize}
                onValueChange={(v) => { setTeamSize(v); clearFieldError("teamSize"); }}
                disabled={isPending}
              >
                <SelectTrigger className={`${SELECT_TRIGGER_BASE} pl-11`} aria-required="true" aria-invalid={!!fieldErrors.teamSize}>
                  <SelectValue placeholder="Select team size" />
                </SelectTrigger>
                <SelectContent>
                  {TEAM_SIZES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FieldError error={fieldErrors.teamSize} id="err-teamSize" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={LABEL_BASE} htmlFor="jobTitle">Job Title *</label>
            <div className="relative">
              <Briefcase className={ICON_BASE} />
              <Input
                id="jobTitle"
                name="jobTitle"
                placeholder="Marketing Director"
                value={jobTitle}
                className={`${INPUT_BASE} pl-11`}
                disabled={isPending}
                autoComplete="organization-title"
                aria-required="true"
                aria-invalid={!!fieldErrors.jobTitle}
                onChange={(e) => { setJobTitle(e.target.value); clearFieldError("jobTitle"); }}
              />
            </div>
            <FieldError error={fieldErrors.jobTitle} id="err-jobTitle" />
          </div>
          <div className="space-y-2">
            <label className={LABEL_BASE} htmlFor="phone">Phone Number *</label>
            <div className="relative">
              <Phone className={ICON_BASE} />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                value={phone}
                className={`${INPUT_BASE} pl-11`}
                disabled={isPending}
                autoComplete="tel"
                aria-required="true"
                aria-invalid={!!fieldErrors.phone}
                onChange={(e) => { setPhone(e.target.value); clearFieldError("phone"); }}
              />
            </div>
            <FieldError error={fieldErrors.phone} id="err-phone" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={LABEL_BASE} htmlFor="country">Country *</label>
            <p className="text-xs text-muted-foreground">{countryStatus}</p>
            <div className="relative">
              <Globe className={ICON_CLASS} />
              <input type="hidden" name="country" value={country} />
              <Select
                value={country}
                onValueChange={(v) => {
                  setManualCountry(v);
                  clearFieldError("country");
                }}
                disabled={isPending}
              >
                <SelectTrigger className={`${SELECT_TRIGGER_BASE} pl-11`} aria-required="true" aria-invalid={!!fieldErrors.country}>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FieldError error={fieldErrors.country} id="err-country" />
          </div>
          <div className="space-y-2">
            <label className={LABEL_BASE} htmlFor="useCase">Use Case *</label>
            <div className="relative">
              <Target className={ICON_CLASS} />
              <input type="hidden" name="useCase" value={useCase} />
              <Select
                value={useCase}
                onValueChange={(v) => { setUseCase(v); clearFieldError("useCase"); }}
                disabled={isPending}
              >
                <SelectTrigger className={`${SELECT_TRIGGER_BASE} pl-11`} aria-required="true" aria-invalid={!!fieldErrors.useCase}>
                  <SelectValue placeholder="Select primary use case" />
                </SelectTrigger>
                <SelectContent>
                  {USE_CASES.map((uc) => (
                    <SelectItem key={uc.value} value={uc.value}>{uc.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FieldError error={fieldErrors.useCase} id="err-useCase" />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={LABEL_BASE} htmlFor="preferredDate">Preferred Date *</label>
            <div className="relative">
              <Calendar className={ICON_BASE} />
              <Input
                id="preferredDate"
                name="preferredDate"
                type="date"
                value={preferredDate}
                min={getTodayString()}
                max={getMaxDateString()}
                className={`${INPUT_BASE} pl-11`}
                disabled={isPending}
                aria-required="true"
                aria-invalid={!!fieldErrors.preferredDate}
                onChange={(e) => { setPreferredDate(e.target.value); clearFieldError("preferredDate"); }}
              />
            </div>
            <FieldError error={fieldErrors.preferredDate} id="err-preferredDate" />
          </div>
          <div className="space-y-2">
            <label className={LABEL_BASE} htmlFor="preferredTime">Preferred Time *</label>
            <div className="relative">
              <Clock className={ICON_CLASS} />
              <input type="hidden" name="preferredTime" value={preferredTime} />
              <Select
                value={preferredTime}
                onValueChange={(v) => { setPreferredTime(v); clearFieldError("preferredTime"); }}
                disabled={isPending}
              >
                <SelectTrigger className={`${SELECT_TRIGGER_BASE} pl-11`} aria-required="true" aria-invalid={!!fieldErrors.preferredTime}>
                  <SelectValue placeholder="Select time slot" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <FieldError error={fieldErrors.preferredTime} id="err-preferredTime" />
          </div>
        </div>

        <div className="space-y-2">
          <label className={LABEL_BASE} htmlFor="notes">Additional Notes</label>
          <div className="relative">
            <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Textarea
              id="notes"
              name="notes"
              placeholder="Tell us about your goals, challenges, or any specific features you'd like to see..."
              value={notes}
              className="min-h-25 rounded-xl border-border bg-background font-medium focus-visible:ring-primary/30 text-foreground pl-11 resize-y"
              disabled={isPending}
              onChange={(e) => { setNotes(e.target.value); clearFieldError("notes"); }}
            />
          </div>
          <FieldError error={fieldErrors.notes} id="err-notes" />
        </div>

        <div className="pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-4">
            By submitting, you agree to our{" "}
            <Link href="/privacy" className="text-primary underline underline-offset-4 hover:no-underline">Privacy Policy</Link>{" "}
            and consent to being contacted about SocialAI products and services.
          </p>
          <Button
            type="submit"
            disabled={isPending}
            aria-busy={isPending}
            className="w-full h-14 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-base font-bold shadow-xl shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Schedule My Demo
                <ArrowRight className="h-5 w-5" />
              </span>
            )}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}

export default function DemoForm() {
  const [formKey, setFormKey] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSuccess = useCallback(() => {
    setShowSuccess(true);
  }, []);

  function handleReset() {
    setFormKey((k) => k + 1);
    setShowSuccess(false);
  }

  return (
    <section id="demo-form" className="relative py-32 overflow-hidden bg-gradient-to-b from-background to-muted/30">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-5 gap-16 items-start">
          <div className="lg:col-span-2 lg:sticky lg:top-32">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary backdrop-blur-sm mb-6">
                <Calendar className="h-3 w-3" />
                Schedule a Demo
              </span>

              <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-foreground mb-6 leading-[1.05]">
                Let&apos;s Find the Right <br />
                <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-emerald-400 bg-clip-text text-transparent">
                  Plan for You
                </span>
              </h2>

              <p className="text-lg text-muted-foreground font-medium mb-10 leading-relaxed">
                Fill in the details and our team will prepare a personalized demo
                tailored to your business needs and goals.
              </p>

              <div className="space-y-6">
                {[
                  { icon: Users, title: "Personalized Walkthrough", desc: "See features relevant to your use case" },
                  { icon: Clock, title: "30-Minute Session", desc: "Focused, efficient, and action-oriented" },
                  { icon: MessageSquare, title: "Q&A with Experts", desc: "Get answers from product specialists" },
                ].map((item) => (
                  <div key={item.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div
            className="lg:col-span-3"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="rounded-xl border border-border bg-card p-6 sm:p-10 shadow-xl">
              <AnimatePresence mode="wait">
                {showSuccess ? (
                  <motion.div
                    key="success"
                    role="status"
                    aria-live="polite"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                    </div>
                    <h3 className="text-2xl font-black text-foreground mb-3">Demo Request Received!</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8">We&apos;ll be in touch within 24 hours.</p>
                    <p className="text-sm text-muted-foreground">
                      In the meantime, explore our{" "}
                      <Link href="/pricing" className="text-primary underline underline-offset-4 hover:no-underline font-bold">
                        pricing plans
                      </Link>
                      or visit our
                      <Link href="/blog" className="text-primary underline underline-offset-4 hover:no-underline font-bold">
                        help center
                      </Link>.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 rounded-xl"
                      onClick={handleReset}
                    >
                      Book Another Demo
                    </Button>
                  </motion.div>
                ) : (
                  <DemoFormInner key={formKey} onSuccess={handleSuccess} />
                )}
              </AnimatePresence>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-4">
              Responses typically within 24 hours. Your information is kept secure per our{" "}
              <Link href="/privacy" className="underline underline-offset-4 hover:no-underline">
                Privacy Policy
              </Link>
              .
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
