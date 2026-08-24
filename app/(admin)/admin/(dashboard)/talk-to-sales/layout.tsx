import TalkToSalesSidebar from "./_components/talk-to-sales-sidebar";

export default function TalkToSalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 overflow-hidden">
      <TalkToSalesSidebar />
      <div className="flex-1 p-6 overflow-auto">
        {children}
      </div>
    </div>
  );
}
