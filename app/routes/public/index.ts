import express, { NextFunction, Request, Response } from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.send(`<h1 style="margin-top:25%; text-align:center">Application is live!</h1>`);
})

export default router;