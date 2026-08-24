import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import ClientWrapper from "@/app/wrapper/client-wrapper";
import ScrollToTop from "@/components/common/ScrollToTop";
import Testimonials from "@/components/home/Testimonials";
import FAQ from "@/components/common/FAQ";
import CTA from "@/components/common/CTA";

export default function MarketingLayout({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <ClientWrapper>
         <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden transition-colors duration-500">
            <Navbar />
            <main>{children}</main>
            <Testimonials />
            <FAQ />
            <CTA />
            <Footer />
            <ScrollToTop />
         </div>
      </ClientWrapper>
   );
}
