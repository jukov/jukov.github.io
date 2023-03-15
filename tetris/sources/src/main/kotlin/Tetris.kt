import kotlinx.browser.document
import kotlinx.browser.window
import org.w3c.dom.*
import org.w3c.dom.events.Event
import org.w3c.dom.events.EventListener
import org.w3c.dom.events.KeyboardEvent
import kotlin.random.Random
import kotlin.random.nextInt

const val WIDTH = 10
const val HEIGHT = 20
const val CELL_SIZE = 25

const val CELL_COLOR = "#DDDDD7"
const val PREDICT_COLOR = "#CCCCCC"
const val CELL_ID = CELL_COLOR

const val COOKIE_BEST_SCORE = "tetris"

const val SATURATION = 80
const val LIGHTNESS = 40

const val COLOR_INCREASE = 10

const val SPEED = 300

val field = Array(HEIGHT) { Array(WIDTH) { CELL_COLOR } }
val figureField = Array(4) { BooleanArray(4) }
val nextField = Array(2) { BooleanArray(4) }
val tempFigureField = Array(4) { BooleanArray(4) }

var figure = Figure.values().random()
var nextFigure = Figure.values().random()

var figureX = WIDTH / 2 - 2
var figureY = -3
var rotation = 0
var score = 0
var colorHue = Random.nextInt(0..360)
var nextColorHue = colorHue + COLOR_INCREASE

var downPressed: Boolean = false
var spacePressed: Boolean = false

lateinit var canvasView: HTMLCanvasElement
lateinit var tetrisContext: CanvasRenderingContext2D
lateinit var nextView: HTMLCanvasElement
lateinit var nextContext: CanvasRenderingContext2D
lateinit var scoreView: HTMLElement
lateinit var bestView: HTMLElement

fun main() {
    canvasView = requireNotNull(document.getElementById("tetris") as HTMLCanvasElement)
    tetrisContext = canvasView.getContext("2d") as CanvasRenderingContext2D
    nextView = requireNotNull(document.getElementById("next") as HTMLCanvasElement)
    nextContext = nextView.getContext("2d") as CanvasRenderingContext2D
    scoreView = requireNotNull(document.getElementById("score") as HTMLElement)
    bestView = requireNotNull(document.getElementById("best") as HTMLElement)

    reset()
    listenKeys()

    window.setInterval(::loop, SPEED)
}

fun reset() {
    for (y in 0 until HEIGHT) {
        for (x in 0 until WIDTH) {
            field[y][x] = CELL_ID
        }
    }

    newFigure()

    figureX = WIDTH / 2 - 2
    figureY = -3
    score = 0
    scoreView.innerHTML = score.toString()

    colorHue = Random.nextInt(0..360)
    nextColorHue = colorHue + COLOR_INCREASE

    setFavicon()

    downPressed = false

    draw()
    setBest()
}

fun setBest() {
    val current = getCookie(COOKIE_BEST_SCORE)
    if (current != null) {
        bestView.innerHTML = current
    }
}

fun updateBestScore() {
    val current = getCookie(COOKIE_BEST_SCORE)?.toInt()
    if (current == null || current < score) {
        setCookie(COOKIE_BEST_SCORE, score.toString(), 365)
        bestView.innerHTML = score.toString()
    }
}

fun listenKeys() {
    document.addEventListener("keydown", object : EventListener {
        override fun handleEvent(event: Event) {
            require(event is KeyboardEvent)
            if (event.code == "ArrowUp" || event.code == "KeyW") {
                rotate()
            } else if (event.code == "ArrowDown" || event.code == "KeyS") {
                if (!downPressed) {
                    downPressed = true
                    shiftFigure()
                }
            } else if (event.code == "ArrowLeft" || event.code == "KeyA") {
                if (canMoveLeft()) {
                    figureX--
                }
            } else if (event.code == "ArrowRight" || event.code == "KeyD") {
                if (canMoveRight()) {
                    figureX++
                }
            } else if (event.code == "Space") {
                if (!spacePressed) {
                    spacePressed = true
                    dropFigure()
                }
            }

            draw()
        }
    })

    document.addEventListener("keyup", object : EventListener {
        override fun handleEvent(event: Event) {
            require(event is KeyboardEvent)

            if (event.code == "ArrowDown" || event.code == "KeyS") {
                downPressed = false
            } else if (event.code == "Space") {
                spacePressed = false
            }

            draw()
        }
    })
}

private fun rotate() {
    for (y in 0 until 4) {
        for (x in 0 until 4) {
            tempFigureField[y][x] = figureField[y][x]
        }
    }

    var checkingRotation = rotation

    for (i in 0 until 4) {
        checkingRotation = (checkingRotation + 1).rem(4)
        figure.rotate(tempFigureField)

        for (test in 0 until 5) {
            val testOffset = figure.rotationOffset(checkingRotation, test)
            if (!checkOverlap(tempFigureField, testOffset.y, testOffset.x)) {
                figureX += testOffset.x
                figureY += testOffset.y
                for (y in 0 until 4) {
                    for (x in 0 until 4) {
                        figureField[y][x] = tempFigureField[y][x]
                    }
                }
                rotation = checkingRotation
                return
            }
        }
    }
}

private fun shiftFigure() {
    if (!downPressed) return

    calc()
    draw()

    if (downPressed) {
        window.setTimeout(::shiftFigure, SPEED / 5)
    }
}

private fun dropFigure() {
    while (!checkStuck(figureY)) {
        figureY++
    }
    calc()
}

private fun canMoveLeft(): Boolean {
    val leftIndex = leftIndex()

    if (figureX + leftIndex <= 0) {
        return false
    }

    loopFigure(figureY, figureX) { y, x, offsetY, offsetX ->
        if (offsetY !in 0..HEIGHT) return@loopFigure
        if (offsetX - 1 !in 0..WIDTH) return@loopFigure

        if (figureField[y][x] && field[offsetY][offsetX - 1] != CELL_ID) {
            return false
        }
    }

    return true
}

private fun canMoveRight(): Boolean {
    val rightIndex = rightIndex()

    if (figureX + rightIndex >= WIDTH - 1) {
        return false
    }

    loopFigure(figureY, figureX) { y, x, offsetY, offsetX ->
        if (offsetY !in 0..HEIGHT) return@loopFigure
        if (offsetX + 1 !in 0..WIDTH) return@loopFigure

        if (figureField[y][x] && field[offsetY][offsetX + 1] != CELL_ID) {
            return false
        }
    }

    return true
}

fun newFigure() {
    for (y in 0 until 4) {
        for (x in 0 until 4) {
            figureField[y][x] = false
        }
    }
    for (y in 0 until 2) {
        for (x in 0 until 4) {
            nextField[y][x] = false
        }
    }

    figure = nextFigure
    nextFigure = Figure.values().random()
    figure.fill(figureField)
    nextFigure.fill(nextField)
    rotation = 0
}

fun loop() {
    calc()
    draw()
}

fun draw() {
    tetrisContext.clearRect(0.0, 0.0, canvasView.width.toDouble(), canvasView.height.toDouble())
    nextContext.clearRect(0.0, 0.0, nextView.width.toDouble(), nextView.height.toDouble())

    for (y in 0 until HEIGHT) {
        for (x in 0 until WIDTH) {
            tetrisContext.fillStyle = field[y][x]
            tetrisContext.drawCell(x = x, y = y, offset = 25)
        }
    }

    for (y in 0 until 2) {
        for (x in 0 until 4) {
            if (nextField[y][x]) {
                nextContext.fillStyle = hslToHex(nextColorHue, SATURATION, LIGHTNESS)
            } else {
                nextContext.fillStyle = CELL_COLOR
            }
            nextContext.drawCell(x = x, y = y)
        }
    }

    var predictFigureY = figureY
    while (!checkStuck(predictFigureY)) {
        predictFigureY++
    }

    tetrisContext.fillStyle = PREDICT_COLOR
    for (y in 0 until 4) {
        for (x in 0 until 4) {
            val offsetX = x + figureX
            val offsetY = y + predictFigureY

            if (offsetY in 0 until HEIGHT && offsetX in 0 until WIDTH) {
                if (figureField[y][x]) {
                    tetrisContext.drawCell(x = offsetX, y = offsetY, offset = 25)
                }
            }
        }
    }

    tetrisContext.fillStyle = hslToHex(colorHue, SATURATION, LIGHTNESS)
    loopFigure(figureY, figureX) { y, x, offsetY, offsetX ->
        if (offsetY in 0 until HEIGHT && offsetX in 0 until WIDTH) {
            if (figureField[y][x]) {
                tetrisContext.drawCell(x = offsetX, y = offsetY, offset = 25)
            }
        }
    }
}

private fun CanvasRenderingContext2D.drawCell(x: Int, y: Int, offset: Int = 0) {
    roundRect(
        x = (x * CELL_SIZE + offset).toDouble(),
        y = (y * CELL_SIZE + offset).toDouble(),
        width = (CELL_SIZE - 2).toDouble(),
        height = (CELL_SIZE - 2).toDouble(),
        radius = (CELL_SIZE / 5).toDouble(),
        fill = true,
        stroke = false
    )
}

fun calc() {
    if (checkStuck(figureY)) {
        if (checkLose()) {
            reset()
        } else {
            dumpFigure()
            newFigure()
            figureY = -3
            figureX = WIDTH / 2 - 2
            checkRows()
            colorHue = (colorHue + COLOR_INCREASE).mod(360)
            nextColorHue = (nextColorHue + COLOR_INCREASE).mod(360)
            setFavicon()
        }
    }
    figureY += 1
}

fun setFavicon() {
    val canvas = document.createElement("canvas") as HTMLCanvasElement
    canvas.width = 16
    canvas.height = 16
    val context = canvas.getContext("2d") as CanvasRenderingContext2D
    context.fillStyle = hslToHex(colorHue, SATURATION, LIGHTNESS)
    context.roundRect(0.0, 0.0, 16.0, 16.0, 6.0, true, false)
    val link = document.createElement("link") as HTMLLinkElement
    link.type = "image/x-icon"
    link.rel = "shortcut icon"
    link.href = canvas.toDataURL("image/x-icon");
    document.getElementsByTagName("head")[0]?.appendChild(link)
}

fun checkLose(): Boolean {
    loopFigure(figureY, figureX) { y, x, offsetY, _ ->
        if (figureField[y][x] && offsetY !in 0 until HEIGHT) {
            return true
        }
    }
    return false
}

fun checkRows() {
    var y = HEIGHT - 1
    while (y >= 0) {
        if (field[y].all { it != CELL_COLOR }) {
            for (erasingY in y downTo 1) {
                for (x in 0 until WIDTH) {
                    field[erasingY][x] = field[erasingY - 1][x]
                }
            }
            score++
            scoreView.innerHTML = score.toString()
            updateBestScore()
        } else {
            y--
        }
    }
}

private fun checkStuck(currentY: Int): Boolean {
    val bottomIndex = figureField.indexOfLast { it.contains(true) }

    if (currentY + bottomIndex + 1 >= HEIGHT) {
        return true
    } else {
        loopFigure(currentY, figureX) { y, x, offsetY, offsetX ->
            if (offsetY in 0 until HEIGHT && offsetX in 0 until WIDTH) {
                if (figureField[y][x] && field[offsetY + 1][offsetX] != CELL_COLOR) {
                    return true
                }
            }
        }
    }
    return false
}

private fun checkOverlap(figure: Array<BooleanArray>, testOffsetY: Int, testOffsetX: Int): Boolean {
    for (y in 0 until 4) {
        for (x in 0 until 4) {
            val offsetX = x + figureX + testOffsetX
            val offsetY = y + figureY + testOffsetY

            if (figure[y][x] && offsetX !in 0 until WIDTH) {
                return true
            }

            if (offsetY in 0 until HEIGHT && offsetX in 0 until WIDTH) {
                if (figure[y][x] && field[offsetY][offsetX] != CELL_COLOR) {
                    return true
                }
            }
        }
    }
    return false
}

fun dumpFigure() {
    loopFigure(figureY, figureX) { y, x, offsetY, offsetX ->
        if (offsetX in 0 until WIDTH && offsetY in 0 until HEIGHT) {
            if (field[offsetY][offsetX] == CELL_COLOR && figureField[y][x]) {
                console.log("dumping $colorHue ${hslToHex(colorHue, SATURATION, LIGHTNESS)}")
                field[offsetY][offsetX] = hslToHex(colorHue, SATURATION, LIGHTNESS)
            }
        }
    }
}

inline fun loopFigure(currentY: Int, currentX: Int, action: (y: Int, x: Int, offsetY: Int, offsetX: Int) -> Unit) {
    for (y in 0 until 4) {
        for (x in 0 until 4) {
            val offsetX = x + currentX
            val offsetY = y + currentY

            action(y, x, offsetY, offsetX)
        }
    }
}

fun leftIndex(): Int {
    for (x in 0 until 4) {
        for (y in 0 until 4) {
            if (figureField[y][x]) {
                return x
            }
        }
    }
    error("Empty figure")
}

fun rightIndex(): Int {
    for (x in 3 downTo 0) {
        for (y in 0 until 4) {
            if (figureField[y][x]) {
                return x
            }
        }
    }
    error("Empty figure")
}