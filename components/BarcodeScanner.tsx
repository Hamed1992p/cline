import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void;
  onCancel: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onBarcodeScanned, onCancel }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    if (!codeReaderRef.current) {
        codeReaderRef.current = new BrowserMultiFormatReader();
    }
    const codeReader = codeReaderRef.current;
    
    const startScanner = async () => {
      try {
        const videoInputDevices = await codeReader.listVideoInputDevices();
        if (videoInputDevices.length > 0) {
          const firstDeviceId = videoInputDevices[0].deviceId;
          if (videoRef.current) {
            const controls = await codeReader.decodeFromVideoDevice(firstDeviceId, videoRef.current, (result, err) => {
              if (result) {
                onBarcodeScanned(result.getText());
                codeReader.reset();
              }
              if (err && !(err instanceof NotFoundException)) {
                console.error(err);
                setError('حدث خطأ أثناء محاولة المسح.');
              }
            });
          }
        } else {
          setError('لم يتم العثور على كاميرا.');
        }
      } catch (err) {
        console.error(err);
        setError('لا يمكن الوصول إلى الكاميرا. يرجى التحقق من الأذونات.');
      }
    };

    startScanner();

    return () => {
      if (codeReader) {
        codeReader.reset();
      }
    };
  }, [onBarcodeScanned]);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 sm:p-8 bg-slate-200/50 dark:bg-black/30 backdrop-blur-sm rounded-2xl border border-slate-300/50 dark:border-teal-500/20 shadow-xl flex flex-col items-center gap-4">
      <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">مسح الباركود</h2>
      <div className="w-full h-64 bg-black rounded-lg overflow-hidden relative">
        <video ref={videoRef} className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-3/4 h-1/2 border-4 border-dashed border-red-500/80 rounded-lg animate-pulse"></div>
        </div>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button onClick={onCancel} className="bg-gray-500 text-white font-bold py-2 px-6 rounded-full">
        إلغاء
      </button>
    </div>
  );
};

export default BarcodeScanner;