import { NextResponse } from "next/server";

const GEOIP_PROVIDERS = [
   {
      url: "https://ipwhois.app/json/",
      parse: (data: unknown) => {
         const record = data as { country_code?: string };
         return record.country_code?.toUpperCase() ?? null;
      },
   },
   {
      url: "https://ipapi.co/json/",
      parse: (data: unknown) => {
         const record = data as { country_code?: string };
         return record.country_code?.toUpperCase() ?? null;
      },
   },
];

async function fetchCountryCodeFromProvider(provider: { url: string; parse: (data: unknown) => string | null }) {
   const response = await fetch(provider.url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
   });

   if (!response.ok) {
      throw new Error(`Provider ${provider.url} returned ${response.status}`);
   }

   const payload = await response.json();
   return provider.parse(payload);
}

export async function GET() {
   for (const provider of GEOIP_PROVIDERS) {
      try {
         const countryCode = await fetchCountryCodeFromProvider(provider);
         if (countryCode) {
            return NextResponse.json({ countryCode });
         }
      } catch {
         // Ignore provider errors and continue to fallback providers.
      }
   }

   return NextResponse.json({ countryCode: null });
}
