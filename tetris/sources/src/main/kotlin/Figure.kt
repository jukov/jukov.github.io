enum class Figure {
    I {
        override fun fill(outArray: Array<BooleanArray>) {
            outArray[1][0] = true
            outArray[1][1] = true
            outArray[1][2] = true
            outArray[1][3] = true
        }

        override fun rotate(outArray: Array<BooleanArray>) {
            rotate4(outArray)
        }

        override fun rotationOffset(rotation: Int, test: Int): Point =
            rotationOffsets4[rotation][test]
    },
    L {
        override fun fill(outArray: Array<BooleanArray>) {
            outArray[0][2] = true
            outArray[1][0] = true
            outArray[1][1] = true
            outArray[1][2] = true
        }

        override fun rotate(outArray: Array<BooleanArray>) {
            rotate3(outArray)
        }

        override fun rotationOffset(rotation: Int, test: Int): Point =
            rotationOffsets3[rotation][test]
    },
    J {
        override fun fill(outArray: Array<BooleanArray>) {
            outArray[0][0] = true
            outArray[1][0] = true
            outArray[1][1] = true
            outArray[1][2] = true
        }

        override fun rotate(outArray: Array<BooleanArray>) {
            rotate3(outArray)
        }

        override fun rotationOffset(rotation: Int, test: Int): Point =
            rotationOffsets3[rotation][test]
    },
    T {
        override fun fill(outArray: Array<BooleanArray>) {
            outArray[0][1] = true
            outArray[1][0] = true
            outArray[1][1] = true
            outArray[1][2] = true
        }

        override fun rotate(outArray: Array<BooleanArray>) {
            rotate3(outArray)
        }

        override fun rotationOffset(rotation: Int, test: Int): Point =
            rotationOffsets3[rotation][test]
    },
    O {
        override fun fill(outArray: Array<BooleanArray>) {
            outArray[0][1] = true
            outArray[0][2] = true
            outArray[1][1] = true
            outArray[1][2] = true
        }

        override fun rotate(outArray: Array<BooleanArray>) {
            // This figure cannot be rotated
        }

        override fun rotationOffset(rotation: Int, test: Int): Point =
            error("O cannot be rotated")
    },
    Z {
        override fun fill(outArray: Array<BooleanArray>) {
            outArray[0][0] = true
            outArray[0][1] = true
            outArray[1][1] = true
            outArray[1][2] = true
        }

        override fun rotate(outArray: Array<BooleanArray>) {
            rotate3(outArray)
        }

        override fun rotationOffset(rotation: Int, test: Int): Point =
            rotationOffsets3[rotation][test]
    },
    S {
        override fun fill(outArray: Array<BooleanArray>) {
            outArray[0][1] = true
            outArray[0][2] = true
            outArray[1][0] = true
            outArray[1][1] = true
        }

        override fun rotate(outArray: Array<BooleanArray>) {
            rotate3(outArray)
        }

        override fun rotationOffset(rotation: Int, test: Int): Point =
            rotationOffsets3[rotation][test]
    };

    abstract fun fill(outArray: Array<BooleanArray>)

    abstract fun rotate(outArray: Array<BooleanArray>)

    abstract fun rotationOffset(rotation: Int, test: Int): Point

    protected fun rotate3(outArray: Array<BooleanArray>) {
        val tmp1 = outArray[0][0]
        val tmp2 = outArray[0][1]
        val tmp3 = outArray[0][2]
        outArray[0][0] = outArray[2][0]
        outArray[0][1] = outArray[1][0]
        outArray[0][2] = tmp1 //outArray[0][0]
        outArray[2][0] = outArray[2][2]
        outArray[1][0] = outArray[2][1]
        outArray[2][2] = tmp3 //outArray[0][2]
        outArray[2][1] = outArray[1][2]
        outArray[1][2] = tmp2 //outArray[0][1]
    }

    protected fun rotate4(outArray: Array<BooleanArray>) {
        val tmp1 = outArray[0][0]
        val tmp2 = outArray[0][1]
        val tmp3 = outArray[1][0]
        val tmp4 = outArray[1][1]

        outArray[0][0] = outArray[3][0]
        outArray[3][0] = outArray[3][3]
        outArray[3][3] = outArray[0][3]
        outArray[0][3] = tmp1 //outArray[0][0]

        outArray[0][1] = outArray[2][0]
        outArray[2][0] = outArray[3][2]
        outArray[3][2] = outArray[1][3]
        outArray[1][3] = tmp2 //outArray[0][1]

        outArray[1][0] = outArray[3][1]
        outArray[3][1] = outArray[2][3]
        outArray[2][3] = outArray[0][2]
        outArray[0][2] = tmp3 //outArray[1][0]

        outArray[1][1] = outArray[2][1]
        outArray[2][1] = outArray[2][2]
        outArray[2][2] = outArray[1][2]
        outArray[1][2] = tmp4 //outArray[1][1]

    }

    val rotationOffsets3 = arrayOf(
        arrayOf(Point(0, 0), Point(-1, 0), Point(-1, 1), Point(0, -2), Point(-1, -2)),
        arrayOf(Point(0, 0), Point(1, 0), Point(1, -1), Point(0, 2), Point(1, 2)),
        arrayOf(Point(0, 0), Point(1, 0), Point(1, 1), Point(0, -2), Point(1, -2)),
        arrayOf(Point(0, 0), Point(-1, 0), Point(-1, -1), Point(0, 2), Point(-1, 2))
    )

    val rotationOffsets4 = arrayOf(
        arrayOf(Point(0, 0), Point(-2, 0), Point(1, 0), Point(-2, -1), Point(1, 2)),
        arrayOf(Point(0, 0), Point(-1, 0), Point(2, 0), Point(-1, 2), Point(2, -1)),
        arrayOf(Point(0, 0), Point(2, 0), Point(-1, 0), Point(2, 1), Point(-1, -2)),
        arrayOf(Point(0, 0), Point(1, 0), Point(-2, 0), Point(1, -2), Point(-2, 1))
    )
}