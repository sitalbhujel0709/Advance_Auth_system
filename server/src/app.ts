import express from 'express';
import type {Express} from 'express';
import cookieParser from 'cookie-parser';
import router from './route.js';
import passport from "./lib/passport.js"

const app:Express = express();

app.use(express.json());
app.use(cookieParser())
app.use(passport.initialize())

app.use('/api',router);

export default app;
