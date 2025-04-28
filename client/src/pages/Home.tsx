import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import IPInfoCard from "@/components/IPInfoCard";
import DNSLookupCard from "@/components/DNSLookupCard";
import TerminalUsage from "@/components/TerminalUsage";
import PortScanCard from "@/components/PortScanCard";
import DomainResolverCard from "@/components/DomainResolverCard";
import IPHeader from "@/components/IPHeader";
import { fetchIpInfo } from "@/lib/api";

export default function Home() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['/api/ip'],
    queryFn: fetchIpInfo
  });

  useEffect(() => {
    // Set document title
    document.title = "I KNOW MY IP | Kolay IP Bilgi Servisi";
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white flex flex-col">
      <Navbar />
      
      {/* Büyük IP gösterimi */}
      <IPHeader ipData={data} isLoading={isLoading} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-grow">
        {/* İlk satır: IP Bilgisi ve Terminal Kullanımı */}
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
          <div className="lg:col-span-2 space-y-8">
            <IPInfoCard ipData={data} isLoading={isLoading} error={error} />
            <TerminalUsage />
          </div>
          
          <div className="lg:col-span-1">
            <DNSLookupCard />
          </div>
        </div>
        
        {/* İkinci satır: Port Tarama ve Özelleştirilebilir DNS Sorgulama */}
        <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-8">
            <PortScanCard />
          </div>
          
          <div className="space-y-8">
            <DomainResolverCard />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
