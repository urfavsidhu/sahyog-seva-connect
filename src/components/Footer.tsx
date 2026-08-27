import { Link } from "@tanstack/react-router";
import {
  Facebook,
  HeartHandshake,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Twitter,
  Youtube,
} from "lucide-react";
import { useApp } from "@/lib/app-store";

interface LinkItem {
  label: string;
  to?: string;
}

function FooterColumn({ title, items }: { title: string; items: LinkItem[] }) {
  return (
    <div>
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="space-y-2.5">
        {items.map((item) => (
          <li key={item.label}>
            {item.to ? (
              <Link to={item.to} className="text-sm text-foreground/80 hover:text-primary hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="text-sm text-foreground/80">{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  const { lang } = useApp();

  return (
    <footer className="mt-10 border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* trust strip */}
        <div className="mb-10 grid gap-4 border-b border-border pb-8 sm:grid-cols-3">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-primary-soft p-2.5 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">ID + skill verified</p>
              <p className="text-xs text-muted-foreground">Every worker background-checked</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-accent-soft p-2.5 text-accent-foreground">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Worker-owned cooperatives</p>
              <p className="text-xs text-muted-foreground">85% of every rupee goes to the worker</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-success-soft p-2.5 text-success">
              <Phone className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">24x7 support</p>
              <p className="text-xs text-muted-foreground">We're here whenever you need help</p>
            </div>
          </div>
        </div>

        {/* link columns */}
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
          <div className="col-span-2 sm:col-span-3 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-base font-black text-primary-foreground">
                स
              </span>
              <span className="text-lg font-extrabold tracking-tight">
                Sahyog<span className="text-primary">Seva</span>
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              {lang === "en"
                ? "Verified workers from local cooperatives, booked in seconds. Fair pay, fair price."
                : "स्थानीय सहकारी समितियों के सत्यापित कर्मचारी, कुछ ही सेकंड में बुक करें।"}
            </p>
            <div className="mt-4 flex items-center gap-2">
              {[Facebook, Instagram, Twitter, Youtube, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="tap tap-active grid h-9 w-9 place-items-center rounded-full border border-border text-muted-foreground hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <FooterColumn
            title={lang === "en" ? "Company" : "कंपनी"}
            items={[
              { label: lang === "en" ? "About us" : "हमारे बारे में" },
              { label: lang === "en" ? "Cooperative model" : "सहकारी मॉडल" },
              { label: lang === "en" ? "Careers" : "करियर" },
              { label: lang === "en" ? "Press" : "प्रेस" },
            ]}
          />

          <FooterColumn
            title={lang === "en" ? "For customers" : "ग्राहकों के लिए"}
            items={[
              { label: lang === "en" ? "Browse services" : "सेवाएं देखें", to: "/search" },
              { label: lang === "en" ? "My bookings" : "मेरी बुकिंग", to: "/bookings" },
              { label: lang === "en" ? "My profile" : "मेरी प्रोफ़ाइल", to: "/profile" },
              { label: lang === "en" ? "Help & support" : "सहायता" },
            ]}
          />

          <FooterColumn
            title={lang === "en" ? "For workers" : "कर्मचारियों के लिए"}
            items={[
              { label: lang === "en" ? "Join as a worker" : "कर्मचारी के रूप में जुड़ें", to: "/signup" },
              { label: lang === "en" ? "Worker login" : "कर्मचारी लॉगिन", to: "/login" },
              { label: lang === "en" ? "Earnings & payouts" : "कमाई और भुगतान" },
              { label: lang === "en" ? "Training & certification" : "प्रशिक्षण" },
            ]}
          />

          <FooterColumn
            title={lang === "en" ? "Legal" : "कानूनी"}
            items={[
              { label: lang === "en" ? "Terms of service" : "सेवा की शर्तें" },
              { label: lang === "en" ? "Privacy policy" : "गोपनीयता नीति" },
              { label: lang === "en" ? "Refund policy" : "धनवापसी नीति" },
              { label: lang === "en" ? "Grievance redressal" : "शिकायत निवारण" },
            ]}
          />
        </div>

        {/* bottom bar */}
        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} SahyogSeva Cooperative Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" /> Pune, Maharashtra, India
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" /> support@sahyogseva.coop
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" /> 1800-123-4567
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
