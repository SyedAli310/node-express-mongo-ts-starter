import express, { Request, Response } from "express";
import { NavigationController } from "../controllers";
import AppConfig from "../../config/appconfig"; 
import Utils from "../../utils";

const NavigationRouter = express.Router();

NavigationRouter.get('/story', Utils.asyncHandler(NavigationController.randomStoryGenerator));

// special redirect routes
NavigationRouter.get('/', (req: Request, res: Response) => {
    res.status(308).redirect(AppConfig.clientAppURL);
});

NavigationRouter.get('/github', (req: Request, res: Response) => {
    res.status(308).redirect('https://github.com/dist-even');
});

NavigationRouter.get('/credits', (req: Request, res: Response) => {
    res.status(308).redirect('https://github.com/SyedAli310');
});

NavigationRouter.get('/developer', (req: Request, res: Response) => {
    res.status(308).redirect('https://syedali.vercel.app');
});

NavigationRouter.get('/support', (req: Request, res: Response) => {
    res.status(308).redirect('https://www.buymeacoffee.com/czuar');
});

export { NavigationRouter };
