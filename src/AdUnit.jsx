import { useEffect } from 'react';

export default function AdUnit({ type = "banner" }) {
  useEffect(() => {
    let scriptSrc = "";

    // Select the right ad code based on type
    switch (type) {
      case "social":
        scriptSrc = "https://pl29567189.effectivecpmnetwork.com/29/92/dc/2992dc1f6fb087dc9c856288c4c0da23.js";
        break;
      case "popunder":
        scriptSrc = "https://pl29567191.effectivecpmnetwork.com/24/41/a5/2441a5d184a9a7e03ec96d8a0cdbd5db.js";
        break;
      case "native":
        scriptSrc = "https://pl29567190.effectivecpmnetwork.com/a529e410f654cdc27db44d734f615bb0/invoke.js";
        break;
      case "small": // 320x50
        scriptSrc = "https://www.highperformanceformat.com/c52a2cd10e20efb2665fd506e362b33f/invoke.js";
        break;
      case "medium": // 300x250
        scriptSrc = "https://www.highperformanceformat.com/3035eca599a838c2f35bf8e36fd2111c/invoke.js";
        break;
      case "tall": // 160x300
        scriptSrc = "https://www.highperformanceformat.com/5e139cffe13a88740daab04d84216a09/invoke.js";
        break;
      default: // Default banner
        scriptSrc = "https://pl29567189.effectivecpmnetwork.com/29/92/dc/2992dc1f6fb087dc9c856288c4c0da23.js";
    }

    if (!scriptSrc) return;

    if (document.querySelector(`script[src="${scriptSrc}"]`)) return;

    const script = document.createElement('script');
    script.src = scriptSrc;
    script.async = true;
    document.body.appendChild(script);

    return () => {
      const scripts = document.querySelectorAll('script[src*="effectivecpmnetwork"], script[src*="highperformanceformat"]');
      scripts.forEach(s => {
        if (s.parentNode) s.parentNode.removeChild(s);
      });
    };
  }, [type]);

  return (
    <div className="my-8 py-4 border border-dashed border-gray-700 rounded-2xl text-center bg-gray-950">
      <p className="text-xs text-gray-500 mb-4 tracking-widest uppercase">SPONSORED</p>
      <div className="min-h-[120px] flex items-center justify-center text-gray-400 text-sm" >
        {/* Ad will be injected here */}
      </div>
    </div>
  );
}
