import { Injectable, Logger } from '@nestjs/common';
import { LocalAccount } from '@account/entities/local-account.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { compare, genSalt, hash } from 'bcrypt';

@Injectable()
export class LocalAccountService {
	private readonly logger: Logger;

	constructor(
		@InjectRepository(LocalAccount)
		private readonly repository: Repository<LocalAccount>,
	) {
		this.logger = new Logger(LocalAccount.name);
	}

	async generate(password: string): Promise<LocalAccount> {
		const salt = await genSalt(10);
		const hashedPassword = await hash(password, salt);
		const account = this.repository.create({
			hashedPassword,
			salt,
		});
		return await this.repository.save(account);
	}

	async reset(password: string, account: LocalAccount) {
		const salt = await genSalt(10);
		const hashedPassword = await hash(password, salt);
		account.salt = salt;
		account.hashedPassword = hashedPassword;
		return await this.repository.save(account);
	}

	async verify(password: string, account: LocalAccount) {
		return compare(password, account.hashedPassword);
	}
}
