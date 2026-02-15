import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../../services/auth.service';
import { RegisterUserCommand } from '../commands/register-user.command';
import { UserRegisteredEvent } from '../../domain/events/user-registered.event';

@CommandHandler(RegisterUserCommand)
export class RegisterUserHandler implements ICommandHandler<RegisterUserCommand> {
  constructor(
    private readonly authService: AuthService,
    private readonly eventBus: EventBus
  ) {}

  async execute(command: RegisterUserCommand) {
    const result = await this.authService.createUser(
      command.name,
      command.email,
      command.password
    );

    this.eventBus.publish(
      new UserRegisteredEvent(result.user.id, result.user.email)
    );

    return result;
  }
}
