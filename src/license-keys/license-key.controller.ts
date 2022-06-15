import { Body, Controller, Get, Headers, Param, ParseUUIDPipe, Post } from "@nestjs/common";
import {
    ApiBearerAuth,
    ApiCreatedResponse,
    ApiOkResponse,
    ApiOperation,
    ApiTags,
} from "@nestjs/swagger";
import { CreateLicenseKeyDto } from "./dto/create-license-key.dto";
import { LicenseKey } from "./models/license-key.model";
import { LicenseKeyService } from "./license-key.service";

@ApiBearerAuth()
@ApiTags("License keys")
@Controller("license-keys")
export class LicenseKeyController {
    public constructor(private readonly licenseKeyService: LicenseKeyService) {}

    @ApiOperation({ summary: "Get all licenses" })
    @ApiOkResponse({ type: [LicenseKey] })
    @Get()
    public findAll(@Headers("Authorization") auth: string) {
        return this.licenseKeyService.getLicenseKeys(auth);
    }

    @ApiOperation({ summary: "Add new license key" })
    @ApiCreatedResponse({
        type: LicenseKey,
        description: "The record has been successfully created",
    })
    @Post()
    public create(@Body() dto: CreateLicenseKeyDto) {
        return this.licenseKeyService.createLicenseKey(dto);
    }

    @ApiOperation({ summary: "Get a particular license key by id" })
    @ApiOkResponse({ type: LicenseKey })
    @Get(":id")
    public findOne(@Headers("Authorization") auth: string, @Param("id", ParseUUIDPipe) id: string) {
        return this.licenseKeyService.getLicenseKey(auth, id);
    }
}
