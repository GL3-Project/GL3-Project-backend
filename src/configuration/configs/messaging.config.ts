import * as process from 'process';
import { registerAs } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { Address } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'path';

export interface MessagingConfig {
	emailing: MailerOptions & {
		sender: string | Address;
	};
}

export const messagingConfig = registerAs('messaging', (): MessagingConfig => {
	if (process.env.SENDER_EMAIL === undefined)
		throw new InternalServerErrorException('No sender email');

	if (process.env.NODEMAILER_USER === undefined)
		throw new InternalServerErrorException('No nodemailer user');

	if (process.env.NODEMAILER_PASSWORD === undefined)
		throw new InternalServerErrorException('No nodemailer password');

	return {
		emailing: {
			sender: {
				address: process.env.SENDER_EMAIL,
				name: process.env.SENDER_NAME ?? 'National Cyber Security Congress',
			},
			transport: {
				service: 'gmail',
				auth: {
					user: process.env.NODEMAILER_USER,
					pass: process.env.NODEMAILER_PASSWORD,
				},
			},
			template: {
				dir: path.join(process.cwd() + '/templates'),
				adapter: new HandlebarsAdapter(),
				options: {
					strict: true,
				},
			},
		},
	};
});
