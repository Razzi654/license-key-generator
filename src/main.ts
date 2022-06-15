import {
    Logger,
    ValidationError,
    ValidationPipe,
    VersioningOptions,
    VersioningType,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { version } from "../package.json";
import { ExceptionResponse } from "./util-classes/exception-response.util";
import { getVersion } from "./utils/functions";

async function bootstrap(): Promise<void> {
    const PORT = process.env.PORT || 3001;
    const API_PREFIX = "/softlice";
    const DOCS_PREFIX = `${API_PREFIX}/docs`;
    const [major, minor, patch] = version.split(".");
    const validationPipe = new ValidationPipe({
        enableDebugMessages: true,
        forbidUnknownValues: true,
        exceptionFactory: (errors: ValidationError[]) => ExceptionResponse.badRequest(errors),
    });
    const versioningOptions: VersioningOptions = {
        type: VersioningType.URI,
        defaultVersion: getVersion(major, minor),
    };

    const app = await NestFactory.create(AppModule);

    app.enableVersioning(versioningOptions)
        .useGlobalPipes(validationPipe)
        .setGlobalPrefix(API_PREFIX);

    const docsConfig = new DocumentBuilder()
        .setTitle("API documentation")
        .setVersion(getVersion(major, minor, patch))
        .addBearerAuth({ type: "http" })
        .build();

    const document = SwaggerModule.createDocument(app, docsConfig);
    SwaggerModule.setup(DOCS_PREFIX, app, document);

    await app.listen(PORT, () => Logger.log(`Server started on port ${PORT}`));
}

bootstrap();
