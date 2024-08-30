'use server'

import { ID, Query } from "node-appwrite"
import { databases, messaging } from "../appwrite.config"
import { formatDateTime, parseStringify } from "../utils"
import { Appointment } from "@/types/appwrite.types"
import { revalidatePath } from "next/cache"

export const createAppointment = async (appointment: CreateAppointmentParams) => {
  try {
    const newAppointment = await databases.createDocument(
      process.env.DATABASE_ID!,
      process.env.APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      appointment
    )

    return parseStringify(newAppointment)
  } catch (error) {
    console.log(error)
  }
}

export const getAppointment = async (appointmentId: string) => {
  try {
    const appointment = await databases.getDocument(
      process.env.DATABASE_ID!,
      process.env.APPOINTMENT_COLLECTION_ID!,
      appointmentId
    )

    return parseStringify(appointment)
  } catch (error) {
    console.log(error)
  }
}

export const getRecentAppointmentsList = async () => {
  try {
    const appointments = await databases.listDocuments(
      process.env.DATABASE_ID!,
      process.env.APPOINTMENT_COLLECTION_ID!,
      [Query.orderDesc('$createdAt')]
    )

    const initialCounts = {
      scheduledCount: 0,
      pendingCount: 0,
      cancelledCount: 0,
    }

    const counts = (appointments.documents as Appointment[]).reduce((acc, appointment) => {
      if (appointment.status === 'scheduled') {
        acc.scheduledCount++
      } else if (appointment.status === 'pending') {
        acc.pendingCount++
      } else if (appointment.status === 'cancelled') {
        acc.cancelledCount++
      }

      return acc
    }, initialCounts)

    const data = {
      totalCount: appointments.total,
      ...counts,
      documents: appointments.documents
    }

    return parseStringify(data)
  } catch (error) {
    console.log(error)
  }
}

export const updateAppointment = async ({ appointmentId, userId, appointment, type }: UpdateAppointmentParams) => {
  try {
    const updatedAppointment = await databases.updateDocument(
      process.env.DATABASE_ID!,
      process.env.APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      appointment
    )

    if (!updatedAppointment) {
      throw new Error('Appointment not found')
    }

    const smsMessage = `
      Hi, it's CarePulse.
      ${type === 'schedule'
        ? `Your appointment has been scheduled for ${formatDateTime(appointment.schedule).dateTime} with Dr. ${appointment.primaryPhysician}`
        : `We regret to inform you that your appointment has been cancelled for the following reason: ${appointment.cancellationReason}`
      }
    `

    await sendSMSNotification(userId, smsMessage)

    revalidatePath('/admin')
    return parseStringify(updatedAppointment)
  } catch (error) {
    console.log(error)
  }
}

export const sendSMSNotification = async (userId: string, content: string) => {
  try {
    const mesage = await messaging.createSms(
      ID.unique(),
      content,
      [],
      [userId]
    )

    return parseStringify(mesage)
  } catch (error) {
    console.log(error)
  }
}