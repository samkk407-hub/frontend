import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { API_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CustomerUploadPage() {
  const { shopId } = useParams();
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    pages: "",
    printType: "portrait",
    colorMode: "bw",
    paymentMethod: "cash",
    document: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [printReleaseOtp, setPrintReleaseOtp] = useState("");
  const [mobileOtpMessage, setMobileOtpMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ ...prev, document: file }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.document) {
      setMessage("Please select a document to upload");
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("shopId", shopId!);
      data.append("customerName", formData.customerName);
      data.append("customerPhone", formData.customerPhone);
      data.append("pages", formData.pages);
      data.append("printType", formData.printType);
      data.append("colorMode", formData.colorMode);
      data.append("paymentMethod", formData.paymentMethod);
      data.append("document", formData.document);

      const response = await axios.post(`${API_URL}/order/create`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOrderId(response.data.orderId);
      setMessage(`Order created successfully! Order ID: ${response.data.orderId}. Please verify the mobile OTP.`);
      if (response.data.mobileOtp) {
        setMobileOtp(response.data.mobileOtp);
        setMobileOtpMessage(`Test OTP: ${response.data.mobileOtp}`);
      }
    } catch (error: any) {
      setMessage(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyMobileOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId || !mobileOtp) {
      setMobileOtpMessage("Please enter the OTP and create an order first.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/order/verify-mobile-otp`, {
        orderId,
        otp: mobileOtp,
      });
      setPrintReleaseOtp(response.data.printReleaseOtp);
      setMobileOtpMessage("Mobile OTP verified. Use the print release OTP on the shop dashboard.");
    } catch (error: any) {
      setMobileOtpMessage(error.response?.data?.message || "Invalid mobile OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Upload Document for Printing</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="customerName">Name</Label>
              <Input
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                required
              />
            </div>
            <div>
              <Label htmlFor="pages">Number of Pages</Label>
              <Input
                id="pages"
                name="pages"
                type="number"
                value={formData.pages}
                onChange={handleInputChange}
                required
                min="1"
              />
            </div>
            <div>
              <Label htmlFor="printType">Print Type</Label>
              <select
                id="printType"
                value={formData.printType}
                onChange={(e) => handleSelectChange("printType", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>
            <div>
              <Label htmlFor="colorMode">Color Mode</Label>
              <select
                id="colorMode"
                value={formData.colorMode}
                onChange={(e) => handleSelectChange("colorMode", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="bw">Black & White</option>
                <option value="color">Color</option>
              </select>
            </div>
            <div>
              <Label htmlFor="document">Document</Label>
              <Input
                id="document"
                name="document"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Creating Order..." : "Create Order"}
            </Button>
          </form>

          {orderId && (
            <div className="mt-6 space-y-4 rounded-xl border border-gray-200 bg-white p-4">
              <div>
                <p className="text-sm text-gray-500">Order ID: <span className="font-medium text-gray-800">{orderId}</span></p>
                {printReleaseOtp && (
                  <p className="text-sm text-green-700">Print Release OTP: <span className="font-semibold">{printReleaseOtp}</span></p>
                )}
              </div>
              <form onSubmit={handleVerifyMobileOtp} className="space-y-4">
                <div>
                  <Label htmlFor="mobileOtp">Mobile OTP</Label>
                  <Input
                    id="mobileOtp"
                    name="mobileOtp"
                    value={mobileOtp}
                    onChange={(e) => setMobileOtp(e.target.value)}
                    placeholder="Enter OTP sent to customer phone"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Verifying OTP..." : "Verify Mobile OTP"}
                </Button>
              </form>
              {mobileOtpMessage && (
                <p className={`text-sm ${mobileOtpMessage.includes("verified") ? "text-green-600" : "text-red-600"}`}>
                  {mobileOtpMessage}
                </p>
              )}
              {mobileOtpMessage === "Mobile OTP verified. Use the print release OTP on the shop dashboard." && (
                <p className="text-sm text-gray-600">Then go to shop dashboard and enter the print release OTP.</p>
              )}
              {mobileOtpMessage && mobileOtpMessage.includes("Test OTP") && (
                <p className="text-sm text-gray-600">Note: This is visible only in development mode.</p>
              )}
            </div>
          )}

          {message && (
            <p className={`mt-4 text-sm ${message.includes("successfully") ? "text-green-600" : "text-red-600"}`}>
              {message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}