import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoClient } from "mongodb";

let client;
async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(process.env.MONGODB_URI);
    await client.connect();
  }
  return client.db();
}

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const db = await connectToDatabase();
      const usersCollection = db.collection("users");

      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email: user.email });
      if (!existingUser) {
        // Insert new user
        await usersCollection.insertOne({
          username: user.name,
          firstname: null,
          lastname: null,
          email: user.email,
          role: null,
          image: user.image,
          signature: null,
          createdAt: new Date(),
        });
      }
      return true;
    },
    async session({ session, token }) {
      const db = await connectToDatabase();
      const usersCollection = db.collection("users");

      // Fetch the user's details from the database
      const user = await usersCollection.findOne({ email: session.user.email });
      session.user.firstname = user?.firstname || null; // Add firstname to session
      session.user.lastname = user?.lastname || null;   // Add lastname to session
      session.user.role = user?.role || null;           // Add role to session
      session.user.id = token.sub;                      // Add user ID to session
      session.accessToken = token.accessToken;          // Add accessToken to session
      return session;
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token; // Save accessToken in JWT
      }
      return token;
    },
  },
});
