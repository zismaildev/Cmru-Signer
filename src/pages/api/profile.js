import { MongoClient } from 'mongodb';

const clientPromise = MongoClient.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then((client) => client);

export default async (req, res) => {
  if (req.method === 'POST') {
    const { email, firstName, lastName, role, signature } = req.body;

    const client = await clientPromise;
    const usersCollection = client.db().collection('users');

    const result = await usersCollection.updateOne(
      { email },
      {
        $set: {
          firstName,
          lastName,
          role,
          signature,
        },
      },
      { upsert: true }
    );

    if (result.modifiedCount > 0 || result.upsertedCount > 0) {
      res.status(200).json({ message: 'Profile updated successfully' });
    } else {
      res.status(500).json({ message: 'Failed to update profile' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
