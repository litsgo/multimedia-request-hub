import { STATUS_LABELS, TASK_TYPE_LABELS } from '@/types';
import type { TaskStatus, TaskType } from '@/types';

interface EmailNotificationPayload {
  taskId: string;
  employeeEmail: string;
  employeeName: string;
  status: TaskStatus;
  taskType: TaskType;
  description: string;
  deadline: string;
}

export async function sendStatusUpdateEmail(payload: EmailNotificationPayload) {
  try {
    if (!payload.employeeEmail) {
      console.warn('No email address provided');
      return;
    }

    const emailContent = {
      to: payload.employeeEmail,
      subject: `Task Status Update: ${payload.taskId} - ${STATUS_LABELS[payload.status]}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #006633; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
            <h2 style="margin: 0;">Task Status Update</h2>
          </div>
          
          <div style="border: 1px solid #ddd; padding: 20px; border-radius: 0 0 8px 8px;">
            <p>Dear ${payload.employeeName},</p>
            <p>Your multimedia request has been updated. Please see the details below:</p>
            
            <div style="background-color: #f5f5f5; border-left: 4px solid #006633; padding: 16px; margin: 16px 0; border-radius: 4px;">
              <p style="margin: 8px 0;"><strong>Task ID:</strong> ${payload.taskId}</p>
              <p style="margin: 8px 0;"><strong>Task Type:</strong> ${TASK_TYPE_LABELS[payload.taskType]}</p>
              <p style="margin: 8px 0;"><strong>Current Status:</strong> <span style="color: #006633; font-weight: bold; font-size: 16px;">${STATUS_LABELS[payload.status]}</span></p>
              <p style="margin: 8px 0;"><strong>Description:</strong> ${payload.description}</p>
              <p style="margin: 8px 0;"><strong>Target Completion Date:</strong> ${new Date(payload.deadline).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-top: 20px;">If you have any questions about your request, please contact the admin team.</p>
            <p style="color: #999; font-size: 12px; margin-top: 20px; border-top: 1px solid #ddd; padding-top: 20px;">
              © 2025 Multimedia Request Management System. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    // Call Supabase Edge Function to send email
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const response = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailContent),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to send email notification:', errorData);
    } else {
      const successData = await response.json();
      console.log('Email notification sent successfully to:', payload.employeeEmail, successData);
    }
  } catch (error) {
    console.error('Error sending email:', error);
  }
}
