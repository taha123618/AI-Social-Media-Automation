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
         <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary overflow-x-clip transition-colors duration-300">
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
