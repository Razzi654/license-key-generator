// Common imports
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigModuleOptions } from "@nestjs/config";
import { SequelizeModule, SequelizeModuleOptions } from "@nestjs/sequelize";
import { LicenseKey } from "./license-keys/models/license-key.model";
import { LicenseKeyModule } from "./license-keys/license-key.module";
import { APP_GUARD } from "@nestjs/core";
import { JwtAuthGuard } from "./auth/guards/jwt-auth.guard";
import { AuthModule } from "./auth/auth.module";
import { ScheduleModule } from "@nestjs/schedule";

const getEnvConfig = (): ConfigModuleOptions => {
    const { NODE_ENV } = process.env;
    return {
        cache: true,
        isGlobal: true,
        envFilePath: `.${NODE_ENV}.env`,
    };
};

const getDbConfig = (): SequelizeModuleOptions => {
    const { POSTGRES_HOST, POSTGRES_PORT, POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD } =
        process.env;
    return {
        dialect: "postgres",
        host: POSTGRES_HOST,
        port: Number(POSTGRES_PORT),
        database: POSTGRES_DB,
        username: POSTGRES_USER,
        password: POSTGRES_PASSWORD,
        models: [LicenseKey],
        autoLoadModels: true,
    };
};

@Module({
    imports: [
        ConfigModule.forRoot(getEnvConfig()),
        SequelizeModule.forRoot(getDbConfig()),
        ScheduleModule.forRoot(),
        LicenseKeyModule,
        AuthModule,
    ],
    controllers: [],
    providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
})
export class AppModule {}
