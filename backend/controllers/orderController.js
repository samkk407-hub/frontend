const https = require("https");
const Order = require("../models/Order");
const { createNewOrder, verifyMobileOtp, verifyPrintReleaseOtp, markOrderPrinted } = require("../services/orderService");
const { uploadBuffer, cloudinary } = require("../utils/cloudinary");

// Create order controller: accepts form-data with document upload.
exports.createOrder = async (req, res) => {
  try {
    const { shopId, customerName, customerPhone, pages, printType, colorMode, paymentMethod } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Document file is required" });
    }

    const uploadResult = await uploadBuffer(req.file.buffer, {
      resource_type: "raw",
      folder: "printshop_docs",
      use_filename: true,
      unique_filename: true,
    });

    const documentUrl = uploadResult?.secure_url || null;
    const documentPublicId = uploadResult?.public_id || null;

    const order = await createNewOrder({
      shopId,
      customerName,
      customerPhone,
      pages,
      printType,
      colorMode,
      paymentMethod,
      documentUrl,
      documentPublicId,
    });

    const responsePayload = {
      message: "Order created successfully",
      orderId: order._id
    };

    if (process.env.NODE_ENV !== "production") {
      responsePayload.mobileOtp = order.mobileOtp;
    }

    res.status(201).json(responsePayload);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Verify customer mobile OTP and issue print-release OTP to shop.
exports.verifyMobileOtp = async (req, res) => {
  try {
    const { orderId, otp } = req.body;
    if (!orderId || !otp) {
      return res.status(400).json({ message: "orderId and otp are required" });
    }

    const result = await verifyMobileOtp(orderId, otp);
    if (!result) {
      return res.status(400).json({ message: "Invalid OTP or order not found" });
    }

    res.json({
      message: "Mobile OTP verified",
      orderId: result.order._id,
      printReleaseOtp: result.printReleaseOtp
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Verify print-release OTP; allow reuse always.
exports.verifyPrintReleaseOtp = async (req, res) => {
  try {
    if (req.user.role !== "shop") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { otp } = req.body;
    if (!otp) {
      return res.status(400).json({ message: "otp is required" });
    }

    const order = await verifyPrintReleaseOtp(req.user.id, otp);
    if (!order) {
      return res.status(404).json({ message: "Order not found or invalid OTP" });
    }

    let documentUrl = order.documentUrl || null;

    if (!documentUrl && order.documentPublicId) {
      documentUrl = cloudinary.url(order.documentPublicId, {
        resource_type: "raw",
        secure: true,
        sign_url: true,
      });
    }

    res.json({
      message: "Print release OTP verified",
      orderId: order._id,
      customerName: order.customerName,
      pages: order.pages,
      printType: order.printType,
      colorMode: order.colorMode,
      paymentMethod: order.paymentMethod,
      documentUrl,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Stream the uploaded document inline for the shop.
exports.getDocument = async (req, res) => {
  try {
    if (req.user.role !== "shop") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const order = await Order.findOne({ _id: id, shopId: req.user.id });
    if (!order || !order.documentUrl) {
      return res.status(404).json({ message: "Document not found" });
    }

    const streamCloudinaryDocument = (remoteUrl, redirects = 0) => {
      https.get(remoteUrl, (cloudRes) => {
        if ([301, 302, 307, 308].includes(cloudRes.statusCode)) {
          if (redirects >= 3) {
            return res.status(500).json({ message: "Too many redirects fetching document" });
          }
          const location = cloudRes.headers.location;
          if (!location) {
            return res.status(500).json({ message: "Redirect without location" });
          }
          return streamCloudinaryDocument(location, redirects + 1);
        }

        if (cloudRes.statusCode !== 200) {
          return res.status(cloudRes.statusCode || 500).json({ message: "Unable to fetch document" });
        }

        const urlPath = new URL(remoteUrl).pathname;
        const isPdf = urlPath.toLowerCase().endsWith(".pdf");
        const contentType = isPdf ? "application/pdf" : cloudRes.headers["content-type"] || "application/octet-stream";
        const filename = `order-${order._id}${isPdf ? ".pdf" : ".doc"}`;

        res.setHeader("Content-Type", contentType);
        res.setHeader("Content-Disposition", `inline; filename="${filename}"`);
        cloudRes.pipe(res);
      }).on("error", (err) => {
        res.status(500).json({ message: err.message });
      });
    };

    streamCloudinaryDocument(order.documentUrl);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Mark the order as printed and keep all order data intact.
exports.markPrinted = async (req, res) => {
  try {
    if (req.user.role !== "shop") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const { id } = req.params;
    const order = await markOrderPrinted(id, req.user.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found or not authorized" });
    }

    res.json({ message: "Order marked as printed", orderId: order._id });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};