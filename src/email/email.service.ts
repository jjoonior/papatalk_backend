import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class EmailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendEmail(email: string): Promise<void> {
    const resetLink = '';

    // todo 에러 한번 터지면 서버 터짐 - 에러처리해도 발생
    /**
     * 탬플릿 파일은 빌드 과정에서 제외되므로 nest-cli.json 에 코드 추가해줘야함
     */
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: `[${process.env.APP_NAME}] 임시 비밀번호 발급`,
        template: './resetPassword',
        context: {
          resetLink,
        },
      });
    } catch (e) {
      console.error(e);
    }
  }
}
