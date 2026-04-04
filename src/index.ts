import express from 'express';

const app = express();
const PORT = 3002;

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});