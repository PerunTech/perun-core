/**
 * Sets a cookie on the current document
 * @param  {string} name The cookie name
 * @param  {string} value The value of the cookie
 */
export function setCookie(name, value) {
    document.cookie = `${name}=${value}; max-age=${(365 * 24 * 60 * 60)}`
}

/**
 * Gets a cookie defined on the current document
 * @param  {string} cookieName The name of the cookie we need
 */
export function getCookie(cookieName) {
    const name = `${cookieName}=`
    const cookiesArr = document.cookie.split(';')
    for (let i = 0; i < cookiesArr.length; i++) {
        let cookie = cookiesArr[i]
        while (cookie.charAt(0) === ' ') {
            cookie = cookie.substring(1)
        }
        if (cookie.indexOf(name) === 0) {
            return cookie.substring(name.length, cookie.length)
        }
    }
    return ''
}
