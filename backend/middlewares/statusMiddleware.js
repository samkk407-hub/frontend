exports.checkStatus = (req, res, next) => {
  const { status } = req.user;
  if (status === "blocked") {
    return res.status(403).json({ message: "Account blocked" });
  }
  if (status === "inactive") {
    return res.status(403).json({ message: "Complete profile first account inactive" });
  }
  if (status === "pending") {
    return res.status(403).json({ message: "Waiting for approval" });
  }
  next();
};
