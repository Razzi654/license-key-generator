import { Module } from "@nestjs/common";
import { JwtModule, JwtModuleOptions } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { JwtStrategy } from "./passport-strategies/jwt.strategy";
import { ConfigModule, ConfigService } from "@nestjs/config";

const jwtOptions = async (config: ConfigService): Promise<JwtModuleOptions> => ({
    secret: config.get("JWT_SECRET"),
    signOptions: { algorithm: "HS512", expiresIn: config.get("JWT_EXPIRES_IN") },
});

@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: jwtOptions,
        }),
        PassportModule,
    ],
    controllers: [],
    providers: [JwtStrategy],
    exports: [],
})
export class AuthModule {}
