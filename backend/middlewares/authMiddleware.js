import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // Get the Authorization header value
    const authHeader = req.headers.authorization;

    // Check if the header value is present
    if (!authHeader) {
      return res.status(401).json({ message: "Missing authorization header" });
    }

    // Check if the header value starts with 'Bearer'
    if (!authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Invalid authorization header format" });
    }

    // Extract the token from the header value
    const token = authHeader.substring(7);

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Attach the decoded token payload to the request object
    req.user = decoded;

    // Proceed to the next middleware
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Invalid authorization token" });
  }
};

export default authMiddleware;
