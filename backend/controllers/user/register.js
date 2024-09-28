import bcrypt from "bcrypt";
import validator from "validator";
import User from "../../models/user.js";

export default async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if all required fields are present
    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Generate a salt for password hashing
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the generated salt
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user with the hashed password
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
    });

   
    res.status(200).json({ msg: "Registration successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
