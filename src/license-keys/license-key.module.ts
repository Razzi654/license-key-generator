import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { LicenseKeyController } from "./license-key.controller";
import { LicenseKey } from "./models/license-key.model";
import { LicenseKeyService } from "./license-key.service";
import { ConfigService, ConfigModule } from "@nestjs/config";
import { JwtModuleOptions, JwtModule } from "@nestjs/jwt";

const jwtOptions = (config: ConfigService): JwtModuleOptions => ({
    secret: config.get("JWT_SECRET"),
    signOptions: { algorithm: "HS512", expiresIn: config.get("JWT_EXPIRES_IN") },
});

@Module({
    imports: [
        SequelizeModule.forFeature([LicenseKey]),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: jwtOptions,
        }),
    ],
    controllers: [LicenseKeyController],
    providers: [LicenseKeyService],
})
export class LicenseKeyModule {}
