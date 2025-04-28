export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white mt-12 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center">
          <p className="text-gray-500 text-sm text-center">
            © {currentYear} I KNOW MY IP (iknowmyip.com). Tüm hakları saklıdır.
          </p>
          <div className="mt-2 text-xs text-gray-400">
            Bu site tamamen eğitim amaçlı hazırlanmıştır.
          </div>
        </div>
      </div>
    </footer>
  );
}
