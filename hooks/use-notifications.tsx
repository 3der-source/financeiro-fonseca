"use client"

import { useState, useEffect } from "react"
import { createClientComponentClient } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export interface Notification {
  id: string
  title: string
  message: string
  isRead: boolean
  type: string
  relatedId?: string
  createdAt: string
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { user } = useAuth()
  const supabase = createClientComponentClient()

  // Carregar notificações do banco de dados
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return

      setIsLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        const formattedNotifications = data.map((n) => ({
          id: n.id,
          title: n.title,
          message: n.message,
          isRead: n.is_read,
          type: n.type,
          relatedId: n.related_id || undefined,
          createdAt: n.created_at,
        }))

        setNotifications(formattedNotifications)
        setUnreadCount(formattedNotifications.filter((n) => !n.isRead).length)
      } catch (err: any) {
        console.error("Erro ao carregar notificações:", err)
        setError(err.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotifications()

    // Configurar subscription para notificações em tempo real
    if (user) {
      const subscription = supabase
        .channel("notifications")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "notifications",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const newNotification = {
              id: payload.new.id,
              title: payload.new.title,
              message: payload.new.message,
              isRead: payload.new.is_read,
              type: payload.new.type,
              relatedId: payload.new.related_id || undefined,
              createdAt: payload.new.created_at,
            }

            setNotifications((prev) => [newNotification, ...prev])
            setUnreadCount((prev) => prev + 1)

            toast.info(newNotification.title, {
              description: newNotification.message,
            })
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(subscription)
      }
    }
  }, [user, supabase])

  const markAsRead = async (id: string) => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("id", id)
        .eq("user_id", user.id)

      if (error) {
        throw error
      }

      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, isRead: true } : notification)),
      )

      setUnreadCount((prev) => Math.max(0, prev - 1))
      return true
    } catch (err: any) {
      console.error("Erro ao marcar notificação como lida:", err)
      setError(err.message)
      return false
    }
  }

  const markAllAsRead = async () => {
    if (!user) return false

    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", user.id)
        .eq("is_read", false)

      if (error) {
        throw error
      }

      setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })))

      setUnreadCount(0)
      return true
    } catch (err: any) {
      console.error("Erro ao marcar todas notificações como lidas:", err)
      setError(err.message)
      return false
    }
  }

  const deleteNotification = async (id: string) => {
    if (!user) return false

    try {
      const { error } = await supabase.from("notifications").delete().eq("id", id).eq("user_id", user.id)

      if (error) {
        throw error
      }

      const deletedNotification = notifications.find((n) => n.id === id)
      setNotifications((prev) => prev.filter((notification) => notification.id !== id))

      if (deletedNotification && !deletedNotification.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1))
      }

      return true
    } catch (err: any) {
      console.error("Erro ao excluir notificação:", err)
      setError(err.message)
      return false
    }
  }

  const addNotification = async (title: string, message: string, type: string, relatedId?: string) => {
    if (!user) return false

    try {
      const newNotification = {
        user_id: user.id,
        title,
        message,
        type,
        related_id: relatedId,
        is_read: false,
      }

      const { error } = await supabase.from("notifications").insert(newNotification)

      if (error) {
        throw error
      }

      return true
    } catch (err: any) {
      console.error("Erro ao adicionar notificação:", err)
      setError(err.message)
      return false
    }
  }

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  }
}

