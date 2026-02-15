import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../../services/auth.service';
import { LoginUserCommand } from '../commands/login-user.command';

@CommandHandler(LoginUserCommand)
export class LoginUserHandler implements ICommandHandler<LoginUserCommand> {
  constructor(private readonly authService: AuthService) {}

  async execute(command: LoginUserCommand) {
    return this.authService.login(command.email, command.password);
  }
}
