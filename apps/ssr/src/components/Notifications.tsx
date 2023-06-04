import * as Cinnabun from "cinnabun"
import { createSignal, Component } from "cinnabun"
import "./notifications.css"
import { generateUUID } from "../utils"
import { DomInterop } from "cinnabun/src/domInterop"

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
      this.prependChildren(child)
      const element = child.element
      element?.addEventListener("mouseenter", function handler() {
        child.props.hovered = true
      })

      element?.addEventListener("mouseleave", function handler() {
        child.props.hovered = false
      })
    }

    const removeNotification = (notification: INotification) => {
      const child = notification.component
      child.element?.removeEventListener("mouseenter", function handler() {
        child.props.hovered = true
      })

      child.element?.removeEventListener("mouseleave", function handler() {
        child.props.hovered = false
      })
      DomInterop.unRender(child)
      notificationStore.value.delete(notification.id)
    }

    if (Cinnabun.Cinnabun.isClient) {
      const tickRateMs = 33

      setInterval(() => {
        const children = this.children as NotificationComponent[]

        for (const [k, notification] of notificationStore.value.entries()) {
          const c = children.find((child) => child.props["data-id"] === k)
          if (!c) {
            addNotification(notification)
          }
        }
        const deleteList: string[] = []
        children.forEach((c) => {
          if (c.props.hovered) return

          const element = c.element,
            notifId: string = c.props["data-id"],
            notification: INotification | undefined =
              notificationStore.value.get(notifId)

          if (!notification) throw new Error("failed to get notification")

          notification.duration -= tickRateMs

          if (notification.duration <= 0) {
            removeNotification(notification)
            deleteList.push(notifId)
          } else if (notification.duration < this.animationDuration) {
            if (!c.props.hidden) {
              element?.classList.add("hide")
              c.props.hidden = true
            }
          }
        })
        if (deleteList.length) {
          const children = this.children as NotificationComponent[]
          this.children = children.filter(
            (c) => !deleteList.includes(c.props["data-id"])
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
