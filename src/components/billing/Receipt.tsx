import { useRef } from "react";
import { CartLine, SaleType, ShopInfo, formatMoney } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Printer, Download, Plus, X } from "lucide-react";
import { toast } from "sonner";

interface Props {
  shop: ShopInfo;
  cart: CartLine[];
  invoiceNo: string;
  date: Date;
  customer?: string;
  cashier?: string;
  saleType?: SaleType;
  discount?: number;
  onClose?: () => void;
  onNew?: () => void;
}

export function Receipt({ 
  shop, 
  cart, 
  invoiceNo, 
  date, 
  customer, 
  cashier, 
  saleType, 
  discount = 0,
  onClose,
  onNew 
}: Props) {
  const receiptRef = useRef<HTMLDivElement>(null);
  
  const subtotal = cart.reduce((s, l) => s + l.qty * l.price, 0);
  const taxable = Math.max(0, subtotal - discount);
  const tax = (taxable * shop.taxPercent) / 100;
  const total = taxable + tax;
  
  // Calculate profit (if cost is available)
  const profit = cart.reduce((s, l) => s + (l.qty * (l.price - (l.cost || 0))), 0);

  const formattedDate = date.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Handle Print
  const handlePrint = () => {
    try {
      const content = receiptRef.current;
      if (!content) {
        toast.error('Receipt content not found');
        return;
      }

      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (!printWindow) {
        toast.error('Please allow popups for printing');
        return;
      }

      const htmlContent = content.innerHTML;
      
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Receipt - ${invoiceNo}</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { 
                font-family: 'Courier New', monospace; 
                padding: 20px; 
                background: white;
                max-width: 350px;
                margin: 0 auto;
              }
              .receipt {
                background: white;
                padding: 15px;
                border: 1px solid #ddd;
              }
              ${getStyles()}
            </style>
          </head>
          <body>
            <div class="receipt">
              ${htmlContent}
            </div>
            <script>
              window.onload = function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              };
            <\/script>
          </body>
        </html>
      `);
      
      printWindow.document.close();
    } catch (error) {
      console.error('Print error:', error);
      toast.error('Failed to print receipt');
    }
  };

  // Handle Download as Text
  const handleDownload = () => {
    try {
      let text = '';
      text += '=' .repeat(40) + '\n';
      text += `  ${shop.name}\n`;
      text += `  ${shop.address}\n`;
      text += `  Tel: ${shop.phone}\n`;
      text += '=' .repeat(40) + '\n\n';
      text += `Invoice: ${invoiceNo}\n`;
      text += `Date: ${formattedDate}\n`;
      text += `Customer: ${customer || "Customer"}\n`;
      text += `Cashier: ${cashier || "Admin"}\n`;
      text += `Payment: ${saleType || "Cash"}\n`;
      text += '\n' + '-'.repeat(40) + '\n';
      text += 'Item          Qty   Rate   Amount\n';
      text += '-'.repeat(40) + '\n';
      
      cart.forEach(item => {
        const name = item.name.length > 15 ? item.name.substring(0, 15) : item.name;
        text += `${name.padEnd(15)} ${String(item.qty).padEnd(5)} ${String(item.price.toFixed(2)).padEnd(6)} ${(item.qty * item.price).toFixed(2)}\n`;
      });
      
      text += '-'.repeat(40) + '\n';
      text += `Subtotal: ${subtotal.toFixed(2)}\n`;
      if (discount > 0) text += `Discount: ${discount.toFixed(2)}\n`;
      if (shop.taxPercent > 0) text += `GST (${shop.taxPercent}%): ${tax.toFixed(2)}\n`;
      text += `TOTAL: ${total.toFixed(2)}\n`;
      if (profit > 0) text += `Profit: ${profit.toFixed(2)}\n`;
      text += '=' .repeat(40) + '\n';
      text += '  Thank you for shopping!\n';
      text += '  Visit again!\n';
      text += '=' .repeat(40) + '\n';

      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${invoiceNo}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Receipt downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download receipt');
    }
  };

  // Handle New Bill
  const handleNew = () => {
    if (onNew) {
      onNew();
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto bg-white rounded-lg shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-2 top-2 z-10 rounded-full p-1 hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Receipt content */}
        <div ref={receiptRef} className="receipt-content p-4">
          <div className="text-center border-b-2 border-dashed border-gray-300 pb-3 mb-3">
            <div className="text-lg font-bold tracking-wider">{shop.name}</div>
            <div className="text-xs text-gray-600">{shop.address}</div>
            <div className="text-xs text-gray-600">Tel: {shop.phone}</div>
          </div>

          <div className="text-xs border-b border-dashed border-gray-200 pb-2 mb-2">
            <div className="flex justify-between">
              <span className="font-semibold">Inv:</span>
              <span>{invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Date:</span>
              <span>{formattedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Customer:</span>
              <span>{customer || "Customer"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Cashier:</span>
              <span>{cashier || "Admin"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">Payment:</span>
              <span>{saleType || "Cash"}</span>
            </div>
          </div>

          <div className="border-b border-dashed border-gray-200 pb-2 mb-2">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-dashed border-gray-300">
                  <th className="py-1 text-left">Item</th>
                  <th className="py-1 text-center">Qty</th>
                  <th className="py-1 text-right">Rate</th>
                  <th className="py-1 text-right">Amt</th>
                </tr>
              </thead>
              <tbody>
                {cart.map((l) => (
                  <tr key={l.code} className="align-top">
                    <td className="py-1">
                      <div>{l.name}</div>
                      <div className="text-[10px] text-gray-400">#{l.code}</div>
                    </td>
                    <td className="py-1 text-center">
                      {l.qty}
                      {l.unit}
                    </td>
                    <td className="py-1 text-right">{l.price.toFixed(2)}</td>
                    <td className="py-1 text-right">{(l.qty * l.price).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Discount</span>
                <span>-{formatMoney(discount)}</span>
              </div>
            )}
            {shop.taxPercent > 0 && (
              <div className="flex justify-between">
                <span>GST ({shop.taxPercent}%)</span>
                <span>{formatMoney(tax)}</span>
              </div>
            )}
            <div className="border-t-2 border-dashed border-gray-300 pt-1 mt-1">
              <div className="flex justify-between text-sm font-bold">
                <span>TOTAL</span>
                <span className="text-green-600">{formatMoney(total)}</span>
              </div>
            </div>
            {profit > 0 && (
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>Est. Profit</span>
                <span className="text-green-500">{formatMoney(profit)}</span>
              </div>
            )}
          </div>

          <div className="text-center border-t-2 border-dashed border-gray-300 pt-3 mt-3">
            <div className="text-xs font-semibold">Thank you for shopping!</div>
            <div className="text-[10px] text-gray-500">Visit again</div>
            <div className="text-[10px] text-gray-400 mt-1">{shop.name}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={handleDownload} variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={handleNew} variant="default" className="flex-1">
              <Plus className="mr-2 h-4 w-4" />
              New
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStyles() {
  return `
    .receipt {
      background: white;
      padding: 15px;
      max-width: 350px;
      margin: 0 auto;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-xs { font-size: 11px; }
    .text-sm { font-size: 13px; }
    .font-bold { font-weight: bold; }
    .font-semibold { font-weight: 600; }
    .border-dashed { border-style: dashed; }
    .border-gray-200 { border-color: #e5e7eb; }
    .border-gray-300 { border-color: #d1d5db; }
    .border-t-2 { border-top-width: 2px; }
    .border-b-2 { border-bottom-width: 2px; }
    .border-b { border-bottom-width: 1px; }
    .pt-1 { padding-top: 4px; }
    .pb-1 { padding-bottom: 4px; }
    .pb-2 { padding-bottom: 8px; }
    .pb-3 { padding-bottom: 12px; }
    .mt-1 { margin-top: 4px; }
    .mb-2 { margin-bottom: 8px; }
    .mb-3 { margin-bottom: 12px; }
    .py-1 { padding-top: 4px; padding-bottom: 4px; }
    .space-y-1 > * + * { margin-top: 4px; }
    .flex { display: flex; }
    .justify-between { justify-content: space-between; }
    .text-gray-400 { color: #9ca3af; }
    .text-gray-500 { color: #6b7280; }
    .text-gray-600 { color: #4b5563; }
    .text-green-500 { color: #22c55e; }
    .text-green-600 { color: #16a34a; }
    .text-red-500 { color: #ef4444; }
    .align-top { vertical-align: top; }
    .w-full { width: 100%; }
  `;
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? "text-sm font-bold" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}