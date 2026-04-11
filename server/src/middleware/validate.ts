import { ZodObject } from "zod";
import type { Request,Response,NextFunction } from "express";

export const validate = (schema: ZodObject<any>)=> {
  return (req: Request,res: Response,next: NextFunction)=>{
    const result = schema.safeParse(req.body);
    if(!result.success){
      return res.status(400).json({error: result.error.format()})
    }
    (req as any).validated  = result.data;
    next();
  }
}