function a(typ: any) {
    return {arrayItems: typ};
}

function u(...typs: any[]) {
    return {unionMembers: typs};
}

function typeVerifier(...typs:any[])
{
    return {typeVerifier: typs}
}

function o(props: any[], additional: any) {
    return {props, additional};
}


function m(additional: any) {
    return {props: [], additional};
}


function r(name: string) {
    return {ref: name};
}

export {a, u, o, m, r,typeVerifier}