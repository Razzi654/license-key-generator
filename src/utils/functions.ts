import { NotFoundException } from "@nestjs/common";
import { TableOptions, Model } from "sequelize-typescript";
import { ExceptionResponse } from "src/util-classes/exception-response.util";
import { ObjectProperty, Stringified } from "./types";

export const getVersion = (...args: string[] | number[]): string => args.join(".");

export const addProperty = <T extends object>(obj: T, property: ObjectProperty): T =>
    Object.assign(obj, property);

export const getTableOptions = (tableName: string): TableOptions<Model> =>
    addProperty(
        { tableName },
        { createdAt: "createdAt", updatedAt: "updatedAt", underscored: true }
    );

export const getLicenseGenBaseUrl = (): string => {
    const {
        LICENSE_GEN_DOMAIN: domain,
        LICENSE_GEN_PORT: port,
        LICENSE_GEN_PREFIX: prefix,
        LICENSE_GEN_NAME: name,
        LICENSE_GEN_VER: v,
    } = process.env;
    return `${domain}:${port}${prefix}v${v}/${name}/`;
};

export const isValidDate = (date: Date): boolean => {
    if (Object.prototype.toString.call(date) !== "[object Date]") {
        return false;
    }
    return !isNaN(date.getTime());
};

export const stringifyProperties = <T extends object>(obj: T): Stringified<T> => {
    const newObj: Stringified<T> = Object();
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[String(key)] = obj[key].valueOf();
        }
    }
    return newObj;
};

export const isObject = (obj: any): obj is object => {
    return typeof obj === "object" && Object.prototype.toString.call(obj) === "[object Object]";
};

export const requireModel = <T extends Model>(model: T, errorMessage: string): void => {
    if (!model) {
        throw ExceptionResponse.notFound(errorMessage);
    }
};
