import Hapi from "@hapi/hapi";

export function setCookie(request:Hapi.Request) {
    let cookie = request.state.session

    if (!cookie) {
        cookie = {
            username: 'futurestudio',
            firstVisit: false
        }
    }

    cookie.lastVisit = Date.now()
}