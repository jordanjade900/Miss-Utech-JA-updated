import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanFailure?: (error: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess, onScanFailure }) => {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      },
      /* verbose= */ false
    );

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch(error => {
        console.error("Failed to clear scanner", error);
      });
    };
  }, [onScanSuccess, onScanFailure]);

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden rounded-[2rem] border border-white/10 bg-black/40">
      <div id="reader" className="w-full"></div>
      <style>{`
        #reader {
          border: none !important;
        }
        #reader__dashboard_section_csr button {
          background-color: #D4AF37 !important;
          color: black !important;
          border: none !important;
          padding: 8px 16px !important;
          border-radius: 9999px !important;
          font-weight: 900 !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
          font-size: 10px !important;
          margin: 10px !important;
          cursor: pointer !important;
        }
        #reader__status_span {
          color: rgba(255, 255, 255, 0.4) !important;
          font-size: 10px !important;
          text-transform: uppercase !important;
          letter-spacing: 0.1em !important;
        }
        #reader__camera_selection {
          background-color: rgba(255, 255, 255, 0.05) !important;
          color: white !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          padding: 4px 8px !important;
          border-radius: 4px !important;
          font-size: 12px !important;
        }
      `}</style>
    </div>
  );
};
