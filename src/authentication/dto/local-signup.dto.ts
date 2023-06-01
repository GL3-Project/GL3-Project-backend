import { IProfile, UserRole } from '@user/intefaces/user.interface';
import {
	IsDefined,
	IsEnum,
	IsStrongPassword,
	registerDecorator,
	validate,
	ValidationArguments,
	ValidationOptions,
} from 'class-validator';
import { StudentProfile } from '@student/entities/student.entity';
import { PersonnelProfile } from '@personnel/entities/personnel.entity';
import { plainToInstance } from 'class-transformer';

export class LocalSignupDto {
	@IsEnum(UserRole)
	role: UserRole;

	@IsDefined()
	@ValidateProfile()
	profile: IProfile;

	@IsStrongPassword()
	password: string;
}

function ValidateProfile(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'validateProfile',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: {
				validate(value: any, args: ValidationArguments) {
					const dto = args.object as LocalSignupDto;
					dto.profile = value;

					let profileClass: any;

					switch (dto.role) {
						case 'student':
							profileClass = StudentProfile;
							break;
						case 'personnel':
							profileClass = PersonnelProfile;
							break;
						default:
							// TODO: Handle invalid role
							break;
					}

					if (profileClass) {
						dto.profile = plainToInstance(profileClass, dto.profile);
					}

					// Validate the local signup DTO
					return validate(dto)
						.then((errors) => {
							return errors.length === 0;
						})
						.catch(() => {
							return false;
						});
				},
			},
		});
	};
}
