import { Request, Response, NextFunction } from "express"

interface IUser {
  username: string
  password: string
}

export class UserService {
  static users: IUser[] = [{ username: "moose", password: "123" }]
  constructor(public username: string, public password: string) {}

  static verifyPassword(user: IUser, password: string) {
    return password === user.password
  }

  static get(username: string): IUser | undefined {
    return UserService.users.find((u) => u.username === username)
  }
}

export const clearInvalidCookie = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.session) {
    res.clearCookie("user")
    return next()
  }
  req.session.reload(function (err) {
    if (err) {
      res.clearCookie("user")
    } else if (
      !("isAuthenticated" in req) ||
      typeof req.isAuthenticated !== "function"
    ) {
      res.clearCookie("user")
    } else if (!req.isAuthenticated()) {
      res.clearCookie("user")
    }
    next()
  })
}

export const useAuth = (req: Request, res: Response, next: NextFunction) => {
  req.session.reload(function (err) {
    if (err) return res.status(500).send()

    if (
      !("isAuthenticated" in req) ||
      typeof req.isAuthenticated !== "function"
    )
      return res.status(401).send()

    if (!req.isAuthenticated()) return res.status(403).send()

    return next()
  })
}
