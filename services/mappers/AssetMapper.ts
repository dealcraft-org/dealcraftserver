import {verify} from "crypto";

interface BaseEntity {
    verify()
}

export abstract class AssetMapper implements BaseEntity {
    private readonly typeMap: any;

    protected constructor(typeMap: any) {
        this.typeMap = typeMap;
        this.verify()
    }

    verify() {

    }

    public static invalidValue(typ: any, val: any, key: any = ''): never {
        if (key) {
            throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
        }
        throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`,);
    }

    static jsonToJSProps(typ: any): any {
        if (typ.jsonToJS === undefined) {
            const map: any = {};
            typ.props.forEach((p: any) => map[p.json] = {key: p.js, typ: p.typ});
            typ.jsonToJS = map;
        }
        return typ.jsonToJS;
    }

    static jsToJSONProps(typ: any): any {
        if (typ.jsToJSON === undefined) {
            const map: any = {};
            typ.props.forEach((p: any) => map[p.js] = {key: p.json, typ: p.typ});
            typ.jsToJSON = map;
        }
        return typ.jsToJSON;
    }

    ds = null;

    transform(val: any, typ: any, getProps: any, key: any = ''): any {
        function transformPrimitive(typ: string, val: any): any {
            if (typeof typ === typeof val) return val;
            return AssetMapper.invalidValue(typ, val, key);
        }

        function transformUnion(this: any, typs: any[], val: any): any {
            // val must validate against one typ in typs
            const l = typs.length;
            for (let i = 0; i <l ; i++) {
                if (typs[i] === null && val === null) return val
            }

            for (let i = 0; i < l; i++) {
                const typ = typs[i];
                try {

                    return this.transform(val, typ, getProps);
                } catch (_) {
                }
            }
            return AssetMapper.invalidValue(typs, val);
        }

        function transformEnum(cases: string[], val: any): any {
            for (let i = 0; i < cases.length; i++) {
                if (cases[i] === null && val === null) return val
            }
            if (cases.indexOf(val) !== -1) return val;
            return AssetMapper.invalidValue(cases, val);
        }

        let transformArray = (typ: any, val: any): any => {
            // val must be an array with no invalid elements
            if (!Array.isArray(val)) return AssetMapper.invalidValue("array", val);
            return val.map(el => this.transform(el, typ, getProps));
        }

        function transformDate(val: any): any {
            if (val === null) {
                return null;
            }
            const d = new Date(val);
            if (isNaN(d.valueOf())) {
                return AssetMapper.invalidValue("Date", val);
            }
            return d;
        }

        let transformObject = (props: { [k: string]: any }, additional: any, val: any): any => {
            if (val === null || typeof val !== "object" || Array.isArray(val)) {
                return AssetMapper.invalidValue("object", val);
            }
            const result: any = {};
            Object.getOwnPropertyNames(props).forEach(key => {
                const prop = props[key];
                const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
                result[prop.key] = this.transform(v, prop.typ, getProps, prop.key);
            });
            Object.getOwnPropertyNames(val).forEach(key => {
                if (!Object.prototype.hasOwnProperty.call(props, key)) {
                    result[key] = this.transform(val[key], additional, getProps, key);
                }
            });
            return result;
        }

        if (typ === "any") return val;
        if (typ === null) {
            if (val === null) return val;
            return AssetMapper.invalidValue(typ, val);
        }
        if (typ === false) return AssetMapper.invalidValue(typ, val);
        while (typeof typ === "object" && typ.ref !== undefined) {
            typ = this.typeMap[typ.ref];
        }
        if (Array.isArray(typ)) return transformEnum(typ, val);
        if (typeof typ === "object") {
            return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
                : typ.hasOwnProperty("arrayItems") ? transformArray(typ.arrayItems, val)
                    : typ.hasOwnProperty("props") ? transformObject(getProps(typ), typ.additional, val)
                        : AssetMapper.invalidValue(typ, val);
        }
        // Numbers can be parsed by Date but shouldn't be.
        if (typ === Date && typeof val !== "number") return transformDate(val);
        return transformPrimitive(typ, val);
    }

    public cast<T>(val: any, typ: any): T {
        return this.transform(val, typ, AssetMapper.jsonToJSProps);
    }

    public uncast<T>(val: T, typ: any): any {
        return this.transform(val, typ, AssetMapper.jsToJSONProps);
    }


}
