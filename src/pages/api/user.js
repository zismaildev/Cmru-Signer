import { MongoClient } from 'mongodb';

const clientPromise = MongoClient.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then((client) => client);

export default async (req, res) => {
  if (req.method === 'GET') {
    const { email } = req.query;

    const client = await clientPromise;
    const usersCollection = client.db().collection('users');

    const user = await usersCollection.findOne({ email });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};
