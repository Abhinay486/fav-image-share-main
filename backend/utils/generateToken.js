import jwt from "jsonwebtoken";

const generateToken = (id, res) => {
    const token = jwt.sign({ id }, process.env.JWT_SEC, {
        expiresIn: "15d",
    });

    res.cookie("token", token, {
        maxAge: 15 * 24 * 60 * 60 * 1000, // Convert days to milliseconds
        httpOnly: true, // Prevent client-side access
        sameSite: "none", // Prevent CSRF attacks
    });
};

export default generateToken;
