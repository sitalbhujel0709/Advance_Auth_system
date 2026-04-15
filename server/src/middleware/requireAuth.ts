import type { Request,Response,NextFunction } from "express";
import jwt from "jsonwebtoken";

export const requireAuth = async (req:Request, res:Response, next:NextFunction) => {
  const accessToken = req.cookies.accessToken;
  if(!accessToken){
    return res.status(401).json({error: "Unauthorized"});
  }
  try {
    const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET as string);
    (req as any).user = decoded;
    next();
  } catch (error) {
    console.log(error)
    return res.status(401).json({error: "Unauthorized"});
  }
}