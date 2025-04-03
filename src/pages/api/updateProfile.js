import { connectToDatabase } from "../../../utils/mongodb";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  // Validate token (optional: implement token validation logic here)

  const { firstName, lastName, signature, email, role } = req.body;

  if (!firstName || !lastName || !signature || !email) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const { db } = await connectToDatabase();

    console.log("Updating user with email:", email);
    console.log("Update data:", { firstName, lastName, role, signature });

    const result = await db.collection("users").updateOne(
      { email },
      {
        $set: {
          firstname: firstName,
          lastname: lastName,
          role: role || null,
          signature: signature,
        },
      }
    );

    console.log("Update result:", result);

    if (result.matchedCount === 0) {
      console.error("No user found with the provided email:", email);
      return res.status(404).json({ message: "User not found" });
    }

    if (result.modifiedCount === 0) {
      console.error("Failed to update profile: No document modified");
      return res.status(500).json({ message: "Failed to update profile" });
    }

    // Return the updated fields in the response
    res.status(200).json({
      message: "Profile updated successfully",
      data: {
        firstname: firstName,
        lastname: lastName,
        role: role || null,
        signature: signature,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
