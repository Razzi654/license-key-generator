import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import * as secp from "@noble/secp256k1";

import * as cryptojs from "crypto-js";
import HexEnc = cryptojs.enc.Hex;
import Utf8Enc = cryptojs.enc.Utf8;
import OpenSSLFormat = cryptojs.format.OpenSSL;
import AES = cryptojs.AES;

import * as fs from "fs";
import { resolve } from "path";
import { CreateLicenseKeyDto } from "./dto/create-license-key.dto";
import { GetLicenseKeyDto } from "./dto/get-license-key.dto";
import { LicenseKey } from "./models/license-key.model";
import { fn, Op } from "sequelize";
import { Cron, CronExpression } from "@nestjs/schedule";
import { JwtPayload } from "src/utils/interfaces";
import { ExceptionResponse } from "src/util-classes/exception-response.util";
import { JwtService } from "@nestjs/jwt";

type IdentityKeys = [privateKey: Uint8Array, publicKey: Uint8Array];

const throwError = (err: NodeJS.ErrnoException) => {
    if (err) {
        throw err;
    }
};

const SHA512 = (message: string | cryptojs.lib.WordArray, cfg?: object) =>
    cryptojs.SHA512(message, cfg).toString(HexEnc);

@Injectable()
export class LicenseKeyService {
    private readonly idKeysDir: string;
    private privateKey: Uint8Array;
    private publicKey: Uint8Array;

    public constructor(
        @InjectModel(LicenseKey) private readonly licenseKeyRepository: typeof LicenseKey,
        private readonly jwtService: JwtService
    ) {
        this.idKeysDir = this.getIdKeysDir();
        [this.privateKey, this.publicKey] = this.getIdentityKeys();
    }

    public async getLicenseKeys(authHeader: string): Promise<GetLicenseKeyDto[]> {
        this.validateAdminFromHeader(authHeader);
        const keys = await this.licenseKeyRepository.findAll({ attributes: ["id", "licenseKey"] });
        return keys;
    }

    public async getLicenseKey(authHeader: string, id: string): Promise<GetLicenseKeyDto> {
        this.validateAdminFromHeader(authHeader);
        const key = await this.licenseKeyRepository.findByPk(id, {
            attributes: ["id", "licenseKey"],
        });
        return key;
    }

    public async createLicenseKey(dto: CreateLicenseKeyDto): Promise<GetLicenseKeyDto> {
        const licenseKey = await this.encrypt(dto);

        console.log("===============================");
        console.log(
            "verified",
            await this.validate(dto.productId, this.decrypt(dto.productId, licenseKey).split(";"))
        );
        console.log("===============================");

        const { expiryDate } = dto;
        const record = await this.licenseKeyRepository.create(
            { licenseKey: licenseKey, expiryDate: expiryDate.toLocaleString() },
            { include: { all: true } }
        );
        return record;
    }

    public validateAdminFromHeader(authHeader: string) {
        const [, bearerToken] = authHeader.split(" ");
        const decodedToken: JwtPayload = this.jwtService.decode(bearerToken) as JwtPayload;

        if (!decodedToken) {
            throw ExceptionResponse.badRequest("Unadle to decode auth token");
        }

        const { accountId } = decodedToken;

        if (!accountId) {
            throw ExceptionResponse.badRequest("Incorrect auth token");
        }

        if (!this.isAdmin(accountId)) {
            throw ExceptionResponse.badRequest("You are not an admin");
        }
    }

    private isAdmin(id: string): boolean {
        return id.startsWith("A_");
    }

    private getIdentityKeys(): IdentityKeys {
        const { ID_PRIVATE_KEY_FILE, ID_PUBLIC_KEY_FILE } = process.env;

        let privateKey: Uint8Array;
        let publicKey: Uint8Array;

        if (!fs.existsSync(this.idKeysDir)) {
            privateKey = secp.utils.randomPrivateKey();
            publicKey = secp.schnorr.getPublicKey(privateKey);

            fs.mkdir(this.idKeysDir, throwError);

            fs.opendir(this.idKeysDir, async (err, dir) => {
                const { path } = dir;

                throwError(err);

                fs.writeFile(
                    resolve(path, ID_PRIVATE_KEY_FILE),
                    privateKey.toString(),
                    { flag: "w" },
                    throwError
                );
                fs.writeFile(
                    resolve(path, ID_PUBLIC_KEY_FILE),
                    publicKey.toString(),
                    { flag: "w" },
                    throwError
                );

                dir.closeSync();
            });

            return [privateKey, publicKey];
        }

        const dir = fs.opendirSync(this.idKeysDir);
        const { path } = dir;

        privateKey = Uint8Array.from(
            fs
                .readFileSync(resolve(path, ID_PRIVATE_KEY_FILE), { flag: "r" })
                .toString()
                .split(",")
                .map(Number)
        );

        publicKey = Uint8Array.from(
            fs
                .readFileSync(resolve(path, ID_PUBLIC_KEY_FILE), { flag: "r" })
                .toString()
                .split(",")
                .map(Number)
        );

        dir.closeSync();

        return [privateKey, publicKey];
    }

    private getIdKeysDir(): string {
        const { ID_KEYS_FOLDER } = process.env;
        return resolve(__dirname.slice(0, __dirname.indexOf("src")), ID_KEYS_FOLDER);
    }

    private async createSign(productId: string, message: string): Promise<string> {
        const messageHash = SHA512(`${productId};${message}`);
        const sign = await secp.schnorr.sign(messageHash, this.privateKey);
        return secp.utils.bytesToHex(sign);
    }

    private async encrypt({
        productId,
        holderName,
        email,
        licenseType,
        expiryDate,
    }: CreateLicenseKeyDto): Promise<string> {
        const passphrase = SHA512(productId);
        const message = `${holderName};${email};${expiryDate.valueOf()};${licenseType}`;
        const sign = await this.createSign(productId, message);
        return AES.encrypt(`${message};${sign}`, passphrase).toString(OpenSSLFormat);
    }

    // Development only
    private decrypt(productId: string, licenseKey: string): string {
        const passphrase = SHA512(productId);
        return AES.decrypt(licenseKey, passphrase).toString(Utf8Enc);
    }

    // Development only
    private async validate(
        visualId: string,
        [holderName, email, expiryDate, linceseType, sign]: string[]
    ): Promise<boolean> {
        const message = `${visualId};${holderName};${email};${expiryDate};${linceseType}`;
        const messageHash = SHA512(message);
        const verified = await secp.schnorr.verify(sign, messageHash, this.publicKey);
        return verified;
    }

    @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
    private async removeExpiredKeys() {
        const now = new Date().toLocaleString();
        Logger.log(`Removing expired license keys at ${now}.`);
        await this.licenseKeyRepository.destroy({ where: { expiryDate: { [Op.lte]: fn("NOW") } } });
    }
}
