import { useCallback } from 'react';

interface CardData {
  name: string;
  symbol: string;
  type: 'currency' | 'crypto' | 'gold' | 'transfer';
  prices: {
    label: string;
    value: number;
    color?: string;
  }[];
  change24h?: number;
  language: 'ar' | 'en';
}

export const useCardImageGenerator = () => {
  const generateCardImage = useCallback(async (data: CardData): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    // Set canvas size
    canvas.width = 600;
    canvas.height = 400;
    
    // Background gradient based on type
    const gradients: Record<string, { start: string; end: string }> = {
      currency: { start: '#1e3a5f', end: '#0d1b2a' },
      crypto: { start: '#4a1d96', end: '#1e1b4b' },
      gold: { start: '#92400e', end: '#451a03' },
      transfer: { start: '#3730a3', end: '#1e1b4b' },
    };
    
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, gradients[data.type].start);
    gradient.addColorStop(1, gradients[data.type].end);
    ctx.fillStyle = gradient;
    ctx.roundRect(0, 0, canvas.width, canvas.height, 20);
    ctx.fill();
    
    // Add decorative elements
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.beginPath();
    ctx.arc(500, 50, 150, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(50, 350, 100, 0, Math.PI * 2);
    ctx.fill();
    
    // Configure font - Cairo
    const isRTL = data.language === 'ar';
    ctx.textAlign = isRTL ? 'right' : 'left';
    
    // Header - Currency name and symbol
    const startX = isRTL ? canvas.width - 40 : 40;
    
    ctx.font = 'bold 36px Cairo, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(data.name, startX, 60);
    
    ctx.font = '20px Cairo, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText(data.symbol, startX, 90);
    
    // Prices section
    let yPos = 140;
    data.prices.forEach((price) => {
      // Label
      ctx.font = '18px Cairo, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText(price.label, startX, yPos);
      
      // Value
      ctx.font = 'bold 32px Cairo, sans-serif';
      ctx.fillStyle = price.color || '#ffffff';
      const formattedValue = new Intl.NumberFormat(isRTL ? 'ar-DZ' : 'en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price.value);
      ctx.fillText(`${formattedValue} DZD`, startX, yPos + 35);
      
      yPos += 70;
    });
    
    // 24h Change if available
    if (data.change24h !== undefined) {
      const changeText = data.language === 'ar' ? 'التغير 24س' : '24h Change';
      const changeValue = `${data.change24h >= 0 ? '+' : ''}${data.change24h.toFixed(2)}%`;
      
      ctx.font = '16px Cairo, sans-serif';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillText(changeText, startX, yPos + 10);
      
      ctx.font = 'bold 24px Cairo, sans-serif';
      ctx.fillStyle = data.change24h >= 0 ? '#22c55e' : '#ef4444';
      ctx.fillText(changeValue, startX, yPos + 40);
    }
    
    // Branding - Bottom
    ctx.textAlign = 'center';
    
    // Separator line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(40, canvas.height - 70);
    ctx.lineTo(canvas.width - 40, canvas.height - 70);
    ctx.stroke();
    
    // Brand name
    ctx.font = 'bold 22px Cairo, sans-serif';
    ctx.fillStyle = '#f59e0b';
    ctx.fillText('E-Sekoir', canvas.width / 2, canvas.height - 40);
    
    // Website
    ctx.font = '14px Cairo, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('sekoir.online', canvas.width / 2, canvas.height - 18);
    
    // Timestamp
    const now = new Date();
    const timestamp = now.toLocaleString(isRTL ? 'ar-DZ' : 'en-US', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
    
    ctx.textAlign = isRTL ? 'left' : 'right';
    ctx.font = '12px Cairo, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.fillText(timestamp, isRTL ? 40 : canvas.width - 40, 30);
    
    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob!);
      }, 'image/png');
    });
  }, []);

  const downloadCardImage = useCallback(async (data: CardData, filename: string) => {
    const blob = await generateCardImage(data);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generateCardImage]);

  return { generateCardImage, downloadCardImage };
};
