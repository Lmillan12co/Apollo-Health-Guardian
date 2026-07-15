import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    service: 'apollo-api',
    status: 'ok'
  });
});

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Apollo API running on port ${port}`);
});
