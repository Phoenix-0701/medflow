import { Injectable, UnauthorizedException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ChangePasswordCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  private cognitoClient: CognitoIdentityProviderClient;

  constructor(private prisma: PrismaService) {
    this.cognitoClient = new CognitoIdentityProviderClient({
      region: process.env.AWS_REGION || 'ap-southeast-2',
    });
  }

  private getSecretHash(username: string): string | undefined {
    const clientId = process.env.COGNITO_CLIENT_ID;
    const clientSecret = process.env.COGNITO_CLIENT_SECRET;
    
    if (!clientSecret || !clientId) {
      return undefined;
    }

    return crypto
      .createHmac('sha256', clientSecret)
      .update(username + clientId)
      .digest('base64');
  }

  // 1. LOGIN FLOW
  async login(email: string, password: string) {
    const clientId = process.env.COGNITO_CLIENT_ID;
    if (!clientId) throw new InternalServerErrorException('Missing COGNITO_CLIENT_ID');

    try {
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
          ...(this.getSecretHash(email) ? { SECRET_HASH: this.getSecretHash(email) as string } : {}),
        },
      });

      const response = await this.cognitoClient.send(command);

      if (!response.AuthenticationResult?.AccessToken) {
        throw new UnauthorizedException('Authentication failed: No access token received');
      }

      // If login is successful on Cognito, find the user in our DB
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedException('User authenticated in Cognito but not found in DB');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('User account is locked or inactive');
      }

      return {
        accessToken: response.AuthenticationResult.AccessToken,
        idToken: response.AuthenticationResult.IdToken,
        refreshToken: response.AuthenticationResult.RefreshToken,
        user,
      };
    } catch (error: any) {
      if (error.name === 'NotAuthorizedException' || error.name === 'UserNotFoundException') {
        throw new UnauthorizedException('Email hoặc mật khẩu không chính xác.');
      }
      throw new InternalServerErrorException(error.message || 'Lỗi hệ thống khi đăng nhập');
    }
  }

  // 2. REGISTER FLOW
  async register(fullName: string, email: string, password: string) {
    const clientId = process.env.COGNITO_CLIENT_ID;
    if (!clientId) throw new InternalServerErrorException('Missing COGNITO_CLIENT_ID');

    try {
      // 1. Sign up on Cognito
      const command = new SignUpCommand({
        ClientId: clientId,
        Username: email,
        Password: password,
        SecretHash: this.getSecretHash(email),
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'name', Value: fullName },
        ],
      });

      const response = await this.cognitoClient.send(command);
      const cognitoId = response.UserSub;

      if (!cognitoId) {
        throw new InternalServerErrorException('Không lấy được UserSub từ Cognito');
      }

      // 2. Sync to local Prisma Database (Status: INACTIVE waiting for OTP)
      const user = await this.prisma.user.create({
        data: {
          cognitoId,
          email,
          fullName,
          isActive: false, // Wait for OTP
          role: 'PATIENT', // Default role for public registration
          patientProfile: {
            create: {} // Create empty patient profile
          }
        },
      });

      return {
        message: 'Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP.',
        user: { email: user.email, cognitoId: user.cognitoId },
      };
    } catch (error: any) {
      if (error.name === 'UsernameExistsException') {
        throw new BadRequestException('Email này đã được đăng ký.');
      }
      throw new InternalServerErrorException(error.message || 'Lỗi đăng ký tài khoản');
    }
  }

  // 3. VERIFY OTP FLOW
  async verifyOtp(email: string, code: string) {
    const clientId = process.env.COGNITO_CLIENT_ID;
    if (!clientId) throw new InternalServerErrorException('Missing COGNITO_CLIENT_ID');

    try {
      // 1. Confirm sign up on Cognito
      const command = new ConfirmSignUpCommand({
        ClientId: clientId,
        Username: email,
        ConfirmationCode: code,
        SecretHash: this.getSecretHash(email),
      });

      await this.cognitoClient.send(command);

      // 2. Activate user in local Database
      const updatedUser = await this.prisma.user.update({
        where: { email },
        data: { isActive: true },
      });

      return {
        message: 'Xác nhận OTP thành công! Tài khoản đã được kích hoạt.',
        user: updatedUser,
      };
    } catch (error: any) {
      if (error.name === 'CodeMismatchException') {
        throw new BadRequestException('Mã OTP không hợp lệ.');
      }
      if (error.name === 'ExpiredCodeException') {
        throw new BadRequestException('Mã OTP đã hết hạn.');
      }
      throw new InternalServerErrorException(error.message || 'Lỗi xác nhận OTP');
    }
  }

  // 4. FORGOT PASSWORD FLOW
  async forgotPassword(email: string) {
    const clientId = process.env.COGNITO_CLIENT_ID;
    if (!clientId) throw new InternalServerErrorException('Missing COGNITO_CLIENT_ID');

    try {
      const command = new ForgotPasswordCommand({
        ClientId: clientId,
        Username: email,
        SecretHash: this.getSecretHash(email),
      });

      await this.cognitoClient.send(command);

      return {
        message: 'Mã xác nhận (OTP) đã được gửi đến email của bạn.',
      };
    } catch (error: any) {
      if (error.name === 'UserNotFoundException') {
        throw new BadRequestException('Email này chưa được đăng ký trong hệ thống.');
      }
      throw new InternalServerErrorException(error.message || 'Lỗi gửi OTP lấy lại mật khẩu');
    }
  }

  // 5. RESET PASSWORD FLOW
  async resetPassword(email: string, code: string, newPassword: string) {
    const clientId = process.env.COGNITO_CLIENT_ID;
    if (!clientId) throw new InternalServerErrorException('Missing COGNITO_CLIENT_ID');

    try {
      const command = new ConfirmForgotPasswordCommand({
        ClientId: clientId,
        Username: email,
        ConfirmationCode: code,
        Password: newPassword,
        SecretHash: this.getSecretHash(email),
      });

      await this.cognitoClient.send(command);

      return {
        message: 'Mật khẩu đã được khôi phục thành công. Bạn có thể đăng nhập bằng mật khẩu mới.',
      };
    } catch (error: any) {
      if (error.name === 'CodeMismatchException') {
        throw new BadRequestException('Mã OTP không hợp lệ.');
      }
      if (error.name === 'ExpiredCodeException') {
        throw new BadRequestException('Mã OTP đã hết hạn.');
      }
      throw new InternalServerErrorException(error.message || 'Lỗi đặt lại mật khẩu');
    }
  }

  // 6. CHANGE PASSWORD FLOW (Authenticated)
  async changePassword(accessToken: string, oldPassword: string, newPassword: string) {
    try {
      const command = new ChangePasswordCommand({
        AccessToken: accessToken,
        PreviousPassword: oldPassword,
        ProposedPassword: newPassword,
      });

      await this.cognitoClient.send(command);

      return {
        message: 'Mật khẩu đã được thay đổi thành công.',
      };
    } catch (error: any) {
      if (error.name === 'NotAuthorizedException') {
        throw new BadRequestException('Mật khẩu cũ không chính xác.');
      }
      throw new InternalServerErrorException(error.message || 'Lỗi đổi mật khẩu');
    }
  }
}
