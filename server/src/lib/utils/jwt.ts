import jwt from 'jsonwebtoken';

type AccessTokenInput = {
  userId: string;
  role : "ADMIN" | "USER"
}

export const generateAccessToken = ({userId,role}:AccessTokenInput):string=>{
  const secretkey = process.env.ACCESS_SECRET_KEY!
  const token = jwt.sign({userId,role},secretkey,{expiresIn:"1hr"});
  return token
}

export const generateRefreshToken = (userId:string):string => {
  const secretkey = process.env.REFRESH_SECRET_KEY!
  const token = jwt.sign({userId},secretkey,{expiresIn:"7d"})
  return token
}