plugins {
    kotlin("js") version "1.8.0"
}

group = "info.jukov"
version = "1"

repositories {
    mavenCentral()
}



kotlin {
    js {
        binaries.executable()
        browser {
            commonWebpackConfig {
                cssSupport {
                    enabled.set(true)
                }
            }
            distribution {
                directory = File("$projectDir").parentFile
            }
        }
    }
}