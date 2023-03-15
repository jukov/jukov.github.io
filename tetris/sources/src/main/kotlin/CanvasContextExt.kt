import org.w3c.dom.CanvasRenderingContext2D

fun CanvasRenderingContext2D.roundRect(
    x: Double,
    y: Double,
    width: Double,
    height: Double,
    radius: Double,
    fill: Boolean = false,
    stroke: Boolean = true
) {
    beginPath()
    moveTo(x + radius, y)
    lineTo(x + width - radius, y)
    quadraticCurveTo(x + width, y, x + width, y + radius)
    lineTo(x + width, y + height - radius)
    quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
    lineTo(x + radius, y + height)
    quadraticCurveTo(x, y + height, x, y + height - radius)
    lineTo(x, y + radius)
    quadraticCurveTo(x, y, x + radius, y)
    closePath()
    if (fill) {
        fill()
    }
    if (stroke) {
        stroke()
    }
}