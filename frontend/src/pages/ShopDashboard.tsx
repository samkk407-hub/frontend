import { useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { API_BASE_URL, API_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Order {
  orderId: string;
  customerName: string;
  pages: number;
  printType: string;
  colorMode: string;
  paymentMethod: string;
  documentUrl: string;
}

export default function ShopDashboard() {
  const { token } = useAuth();
  const [otp, setOtp] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/order/verify-print-otp`,
        { otp },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrder(response.data);
      setMessage("Order verified successfully!");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    if (!order) return;

    const fileUrl = `${API_URL}/order/${order.orderId}/document`;

    setLoading(true);
    try {
      const response = await axios.get(fileUrl, {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });

      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(pdfBlob);
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        throw new Error("Unable to open print window");
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Print Order</title>
            <style>html, body { margin: 0; height: 100%; }</style>
          </head>
          <body>
            <iframe src="${blobUrl}" frameborder="0" style="border:none; width:100vw; height:100vh;"></iframe>
            <script>
              const iframe = document.querySelector('iframe');
              iframe.onload = () => {
                setTimeout(() => {
                  iframe.contentWindow.focus();
                  iframe.contentWindow.print();
                }, 300);
              };
            <\/script>
          </body>
        </html>
      `);
      printWindow.document.close();

      await axios.put(
        `${API_URL}/order/${order.orderId}/print`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage("Order opened for printing and marked as printed.");
    } catch (error: any) {
      setMessage(error.response?.data?.message || "Error opening document for printing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Shop Dashboard</h1>

        {!order ? (
          <Card>
            <CardHeader>
              <CardTitle>Enter Print Release OTP</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="otp">OTP</Label>
                  <Input
                    id="otp"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter 4-digit OTP"
                    maxLength={4}
                    required
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Verify OTP"}
                </Button>
              </form>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer Name</Label>
                  <p className="font-medium">{order.customerName}</p>
                </div>
                <div>
                  <Label>Pages</Label>
                  <p className="font-medium">{order.pages}</p>
                </div>
                <div>
                  <Label>Print Type</Label>
                  <p className="font-medium">{order.printType}</p>
                </div>
                <div>
                  <Label>Color Mode</Label>
                  <p className="font-medium">{order.colorMode}</p>
                </div>
              </div>
              <div>
                <Label>Ready to print</Label>
                <p className="mt-2 text-sm text-gray-600">No download needed. Press the button below to mark this order as printed.</p>
              </div>
              <Button onClick={handlePrint} disabled={loading} className="w-full">
                {loading ? "Printing..." : "Print Order"}
              </Button>
            </CardContent>
          </Card>
        )}

        {message && (
          <p className={`mt-4 text-sm ${message.includes("successfully") || message.includes("printed") ? "text-green-600" : "text-red-600"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
