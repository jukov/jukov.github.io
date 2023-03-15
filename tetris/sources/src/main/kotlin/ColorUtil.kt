import kotlin.math.max
import kotlin.math.min
import kotlin.math.roundToInt

fun hslToHex(hue: Int, saturation: Int, lightness: Int): String {
    val l = lightness / 100.0
    val a = saturation * min(l, 1.0 - l) / 100.0

    fun f(n: Double): String {
        val k = (n + hue / 30.0) % 12
        val color = l - a * max(minOf(k - 3.0, 9.0 - k, 1.0), -1.0)

        return (255 * color).roundToInt().toString(16).padStart(2, '0')
    }

    val r = f(0.0)
    val g = f(8.0)
    val b = f(4.0)

    return "#$r$g$b"
}
