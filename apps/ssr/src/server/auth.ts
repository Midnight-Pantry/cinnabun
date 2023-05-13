export interface IUser {
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

  static login(data: IUser): boolean {
    const userMatch = UserService.get(data.username)
    if (!userMatch) return false
    return userMatch.password === data.password
  }

  static create(data: IUser): boolean {
    const userMatch = UserService.get(data.username)
    if (userMatch) return false
    UserService.users.push(data)
    return true
  }
}

export function configureAuthRoutes(app: Express.Application) {
  // const sendToken = async (username: string, res: FastifyReply) => {
  //   const token = app.jwt.sign({ username })
  //   const refreshToken = await res.jwtSign({ username }, { expiresIn: "1d" })
  //   res
  //     .setCookie("refreshToken", refreshToken, {
  //       domain: "localhost",
  //       path: "/",
  //       httpOnly: false,
  //       sameSite: true, // alternative CSRF protection
  //     })
  //     .code(200)
  //     .send({ token })
  // }
  // app.post("/login", async (req, res) => {
  //   const { username, password } = req.body as {
  //     username?: string
  //     password?: string
  //   }
  //   if (!username || !password) {
  //     res.status(400).send()
  //     return
  //   }
  //   const authed = UserService.login({ username, password })
  //   if (!authed) {
  //     res.status(400).send()
  //     return
  //   }
  //   sendToken(username, res)
  // })
  // app.post("/create-account", async (req, res) => {
  //   const { username, password } = req.body as {
  //     username?: string
  //     password?: string
  //   }
  //   if (!username || !password) {
  //     res.status(400).send()
  //     return
  //   }
  //   const created = UserService.create({ username, password })
  //   if (!created) {
  //     res.status(403).send()
  //     return
  //   }
  //   sendToken(username, res)
  // })
  // app.post("/logout", async (_req, res) => {
  //   res.clearCookie("refreshToken")
  //   res.code(200).send()
  // })
}
