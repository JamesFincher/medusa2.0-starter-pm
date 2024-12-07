import { ProviderSendNotificationDTO } from '@medusajs/types';
import { AbstractNotificationProviderService, MedusaError } from '@medusajs/utils';
import { Resend } from 'resend';

import { validateModuleOptions } from '../../utils/validate-module-options';
import { OrderPlacedEmailTemplate } from './email-templates/order-placed';
import { ResetPasswordEmailTemplate } from './email-templates/reset-password';

type ModuleOptions = {
  apiKey: string;
  fromEmail: string;
  replyToEmail: string;
  toEmail: string;
  enableEmails: string;
  channels?: string[];
};

export enum ResendNotificationTemplates {
  ORDER_PLACED = 'order-placed',
  RESET_PASSWORD = 'reset-password',
  FEED = 'feed'
}

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  private resend: Resend;
  private options: ModuleOptions;
  static identifier = 'resend-notification';

  constructor(container, options: ModuleOptions) {
    super();
    validateModuleOptions(options, 'resendNotificationProvider');

    this.resend = new Resend(options.apiKey);
    this.options = {
      ...options,
      channels: [...(options.channels || ['email']), 'feed'] // Ensure feed channel is included
    };
  }

  // Send mail
  private async sendMail(subject: string, body: any, toEmail?: string) {
    if (this.options.enableEmails.toLowerCase() !== 'true') {
      return {};
    }

    const { data, error } = await this.resend.emails.send({
      from: this.options.fromEmail,
      replyTo: this.options.replyToEmail,
      to: [toEmail ? toEmail : this.options.toEmail],
      subject: subject,
      react: body
    });

    if (error) {
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error.message);
    }

    return data!;
  }

  // Handle feed notifications
  private async handleFeed(notification: ProviderSendNotificationDTO) {
    // For now, just acknowledge the feed notification
    return {
      to: notification.to || this.options.toEmail,
      status: 'success',
      data: notification.data
    };
  }

  // Send order placed mail
  private async sendOrderPlacedMail(notification: ProviderSendNotificationDTO) {
    const orderData = { order: notification?.data };
    const dynamicSubject = notification?.data?.subject as string;

    return await this.sendMail(
      dynamicSubject,
      OrderPlacedEmailTemplate({ data: orderData }),
      notification.to
    );
  }

  // Send reset password mail
  private async sendResetPasswordMail(notification: ProviderSendNotificationDTO) {
    const url = notification?.data?.url as string;
    const dynamicSubject = notification?.data?.subject as string;

    return await this.sendMail(
      dynamicSubject,
      ResetPasswordEmailTemplate({url}),
      notification.to
    );
  }

  async sendNotification(
    event: string,
    data: unknown,
    attachmentGenerator: unknown
  ) {
    // Handle feed channel notifications
    if (event.includes('feed')) {
      return await this.handleFeed({
        to: this.options.toEmail,
        data,
        template: ResendNotificationTemplates.FEED.toString()
      });
    }

    return await super.sendNotification(event, data, attachmentGenerator);
  }

  async send(notification: ProviderSendNotificationDTO) {
    // Handle feed notifications
    if (notification.template === ResendNotificationTemplates.FEED.toString()) {
      return await this.handleFeed(notification);
    }

    switch (notification.template) {
      case ResendNotificationTemplates.ORDER_PLACED.toString():
        return await this.sendOrderPlacedMail(notification);

      case ResendNotificationTemplates.RESET_PASSWORD.toString():
        return await this.sendResetPasswordMail(notification);
    }

    return {};
  }
}

export default ResendNotificationProviderService;