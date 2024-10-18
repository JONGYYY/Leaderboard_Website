import jwt from 'jsonwebtoken';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the decoded user to the request
    req.user = decoded;
    next(); // Continue to the next handler
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Wrapper function to use middleware in Next.js API routes
const withAuth = (handler) => async (req, res) => {
  await authMiddleware(req, res, () => {
    // If authentication passes, continue to the handler
    return handler(req, res);
  });
};

export default withAuth;
