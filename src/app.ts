import express from 'express';
import cors from 'cors';
import habitRouter from './routes/habitRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/habits', habitRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}
);