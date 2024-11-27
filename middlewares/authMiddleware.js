// const jwt = require('jsonwebtoken');

// module.exports.authMiddleware = async(req, res, next) =>{
//     const {accessToken} = req.cookies

//     if (!accessToken) {
//         return res.status(409).json({ error : 'Please Login First'})
//     } else {
//         try {
//             const deCodeToken = await jwt.verify(accessToken,process.env.SECRET)
//             req.role = deCodeToken.role
//             req.id = deCodeToken.id
//             next()            
//         } catch (error) {
//             return res.status(409).json({ error : 'Please Login'})
//         }        
//     }
// }

module.exports.authMiddleware = async (req, res, next) => {
  const { accessToken } = req.cookies;

  if (!accessToken) {
    return res.status(409).json({ error: "Please login first" });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.SECRET);
    req.role = decoded.role;
    req.id = decoded.id;

    console.log("Decoded Token:", decoded);  // Log decoded token to verify the id and role
    next();
  } catch (error) {
    console.error("JWT Error:", error.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

