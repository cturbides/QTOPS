// Task: Extiende el sistema agregando una nueva estrategia de notificación
//  (Discord, Telegram, o Slack) sin modificar las clases existentes.

// Principio de Responsabilidad Única (SRP) y Principio Abierto/Cerrado (OCP)
interface NotificationStrategy {
  send(message: string): Promise<void>;
}

// Definición de tipos y interfaces
interface User {
  id: string;
  email: string;
  phone: string;
  preferences: NotificationPreferences;
}

type NotificationPreferences = {
  [K in CHANNELS]?: boolean;
};

// SRP: Cada clase tiene una responsabilidad específica
class UserPreferencesValidator {
  validate(preferences: NotificationPreferences): boolean {
    return Object.values(preferences).some(pref => pref === true);
  }
}

// OCP: Extensible para nuevos tipos de notificación
class PushNotification implements NotificationStrategy {
  async send(message: string): Promise<void> {
    console.log(`Enviando push notification: ${message}`);
  }
}

// ====================================================================================================
enum CHANNELS {
  SMS = 'sms',
  PUSH = 'push',
  EMAIL = 'email',
  SLACK = 'slack',
  DISCORD = 'discord',
  TELEGRAM = 'telegram',
};

// Nueva estrategia de notificacion: Email
class EmailNotification implements NotificationStrategy {
  async send(message: string): Promise<void> {
    console.log(`Enviando email: ${message}`);
  }
}

// Nueva estrategia de notificacion: SMS
class SMSNotification implements NotificationStrategy {
  async send(message: string): Promise<void> {
    console.log(`Enviando SMS: ${message}`);
  }
}

// Nueva estrategia de notificacion: Discord
class DiscordNotification implements NotificationStrategy {
  async send(message: string): Promise<void> {
    console.log(`Enviando Discord message: ${message}`);
  }
}

// Nueva estrategia de notificacion: Telegram
class TelegramNotification implements NotificationStrategy {
  async send(message: string): Promise<void> {
    console.log(`Enviando Telegram message: ${message}`);
  }
}

// Nueva estrategia de notificacion: Slack
class SlackNotification implements NotificationStrategy {
  async send(message: string): Promise<void> {
    console.log(`Enviando Slack message: ${message}`);
  }
}

// ====================================================================================================
// ====================================================================================================
// ====================================================================================================


// Orquestador que usa ambos principios
class NotificationService {
  constructor(
    private validator: UserPreferencesValidator,
    private strategies: Map<CHANNELS, NotificationStrategy>
  ) { }

  async notifyUser(user: User, message: string): Promise<void> {
    if (!this.validator.validate(user.preferences)) {
      throw new Error('Usuario no tiene preferencias de notificación válidas');
    }

    const notifications: Promise<void>[] = [];

    for (const channel of Object.values(CHANNELS)) {
      if (user.preferences[channel] && this.strategies.has(channel)) {
        notifications.push(this.strategies.get(channel)?.send(message) || Promise.resolve());
      }
    }

    await Promise.all(notifications);
  }
}

// ====================================================================================================
// ====================================================================================================
// ====================================================================================================
// ====================================================================================================

async function demostrateNotificationService() {
  const user: User = {
    id: '123',
    email: 'user@example.com',
    phone: '123-456-7890',
    preferences: {
      sms: true,
      push: true,
      email: true,
      slack: true,
      discord: true,
      telegram: true,
    }
  };

  const validator = new UserPreferencesValidator();
  const strategies = new Map<CHANNELS, NotificationStrategy>([
    [CHANNELS.SMS, new SMSNotification()],
    [CHANNELS.PUSH, new PushNotification()],
    [CHANNELS.EMAIL, new EmailNotification()],
    [CHANNELS.SLACK, new SlackNotification()],
    [CHANNELS.DISCORD, new DiscordNotification()],
    [CHANNELS.TELEGRAM, new TelegramNotification()],
  ]);

  const notificationService = new NotificationService(validator, strategies);

  await notificationService.notifyUser(user, 'Hello, this is a test notification!');
};

demostrateNotificationService().then(() => {
  console.log('Notificaciones enviadas correctamente')
}).catch(error => {
  console.error('Error al enviar notificaciones:', error)
});