import jwt from "jsonwebtoken";

const generateToken = (id, res) => {
    const token = jwt.sign({ id }, process.env.JWT_SEC, {
        expiresIn: "15d",
    });

    res.cookie("token", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, // Convert days to milliseconds
        httpOnly: true, // Prevent client-side access
        sameSite: "strict", // Prevent CSRF attacks
        secure: process.env.NODE_ENV === "production", // Secure cookie in production
    });
};

export default generateToken;
