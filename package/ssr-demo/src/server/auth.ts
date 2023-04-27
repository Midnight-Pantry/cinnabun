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
}
