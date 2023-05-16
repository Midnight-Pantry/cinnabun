import "./notifications.css"
import * as Cinnabun from "cinnabun"
import { createSignal, Component, DomInterop } from "cinnabun"
import { generateUUID } from "../utils"

export enum NotificationType {
  INFO = "info",
  SUCCESS = "success",
  ERROR = "error",
  WARNING = "warning",
}

interface INotification {
  id: string
  text: string
  type: NotificationType
  duration: number
  component: NotificationComponent
  hidden: boolean
  hovered: boolean
  onHovered: () => void
  onUnHovered: () => void
}

export const notificationStore = createSignal<Map<string, INotification>>(
  new Map()
)

export const addNotification = ({
  text,
  type = NotificationType.INFO,
  duration = 3000,
}: {
  text: string
  type?: NotificationType
  duration?: number
}) => {
  const id = generateUUID()
  const notification: Partial<INotification> = {
    id,
    text,
    type,
    duration,
    hidden: false,
    hovered: false,
    onHovered: () => (notification.hovered = true),
    onUnHovered: () => (notification.hovered = false),
  }
  notification.component = new NotificationComponent(id, type, text)
  notificationStore.value.set(notification.id!, notification as INotification)
}

class NotificationComponent extends Component {
  constructor(id: string, type: NotificationType, text: string) {
    super("div", {
      ["data-id"]: id,
      className: `notification ${type}`,
      children: [text],
    })
  }
}

export class NotificationTrayComponent extends Component {
  constructor(private animationDuration: number) {
    super("div", { className: "notification-tray" })

    const addNotification = (notification: INotification) => {
      const child = notification.component
      this.prependChild(child)
      const element: HTMLElement = child.element!

      element.addEventListener("mouseenter", notification.onHovered)
      element.addEventListener("mouseleave", notification.onUnHovered)
    }

    const removeNotification = (notification: INotification) => {
      const child = notification.component
      const el = child.element!
      el.removeEventListener("mouseenter", notification.onHovered)
      el.removeEventListener("mouseleave", notification.onUnHovered)
      DomInterop.unRender(child)
      notificationStore.value.delete(notification.id)
    }

    if (Cinnabun.Cinnabun.isClient) {
      const tickRateMs = 33

      setInterval(() => {
        const children = this.children as NotificationComponent[]

        for (const [k, notification] of notificationStore.value.entries()) {
          const c = children.find((child) => child.getProps()["data-id"] === k)
          if (!c) {
            addNotification(notification)
          }
        }
        const deleteList: string[] = []
        children.forEach((c) => {
          const props = c.getProps()
          const notifId: string = props["data-id"]
          const notification: INotification | undefined =
            notificationStore.value.get(notifId)

          if (!notification) throw new Error("failed to get notification")
          if (notification.hovered) return

          notification.duration -= tickRateMs

          if (notification.duration <= 0) {
            removeNotification(notification)
            deleteList.push(notifId)
          } else if (notification.duration < this.animationDuration) {
            if (!notification.hidden) {
              c.element!.classList.add("hide")
              notification.hidden = true
            }
          }
        })
        if (deleteList.length) {
          const children = this.children as NotificationComponent[]
          this.children = children.filter(
            (c) => !deleteList.includes(c.getProps()["data-id"])
          )
        }
      }, tickRateMs)
    }
  }
}

export const NotificationTray = ({
  animationDuration = 500,
}: {
  animationDuration?: number
}) => new NotificationTrayComponent(animationDuration)
