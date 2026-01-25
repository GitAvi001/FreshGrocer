export class RegisterUserDto {
    email: string;
    password: string;
    role?: string; // 'manager' | 'driver' | 'admin'
}

export class LoginUserDto {
    email: string;
    password: string;
}

export class AuthResponseDto {
    access_token: string;
    user: {
        id: number;
        email: string;
        role: string;
    };
}
