import kotlinx.browser.document
import kotlin.js.Date

fun setCookie(name: String, value: String, expirationDays: Int) {
    val date = Date(Date.now() + (expirationDays * 24 * 60 * 60 * 1000))
    val expiration = "expires=${date.toUTCString()}"
    document.cookie = "$name=$value;$expiration;path=/"
}

fun getCookie(name: String): String? {
    val cookies = document.cookie.split(';')
    for (i in cookies) {
        var cookieValue = i
        while (cookieValue[0] == ' ') {
            cookieValue = cookieValue.substring(1)
        }
        if (cookieValue.indexOf("$name=") == 0) {
            return cookieValue.substring("$name=".length, cookieValue.length)
        }
    }
    return null
}