/**
 * Functions are mapped to blocks using various macros in comments starting with % (e.g., //% block). The most important macro "block" specifies that a block should be generated for a **exported** function.
 */
//% color="#2267d6" icon="\uf10d" block="SGH"
namespace Autonom {
    let speedRight: number;
    let speedLeft: number;

    let ports = {
        LEFTMOTOR: motors.largeA,
        RIGHTMOTOR: motors.largeB,
        FRONTULTRA: sensors.ultrasonic1,
        SIDEULTRA: sensors.ultrasonic2,
        COLORSENSOR: sensors.color3,
        LIGHTSENSOR: sensors.color4
    }

    //% block
    export function veraendereGeschwindigkeit(num: number) {
        if (ports.LEFTMOTOR.speed() < maxSpeed && ports.RIGHTMOTOR.speed() < maxSpeed) {
            motors.largeAB.run(ports.LEFTMOTOR.speed() + num)
        }
    }

    sensors.ultrasonic1.onEvent(UltrasonicSensorEvent.ObjectDetected, function () {
        // Kollisionserkennung
        while (sensors.ultrasonic1.distance() <= 30) {
            if (sensors.ultrasonic1.distance() <= 7) {
                bleibStehen()
            } else if (sensors.ultrasonic1.distance() <= 15) {
                veraendereGeschwindigkeit(-10)
            } else {
                veraendereGeschwindigkeit(-10)
            }
            pause(60);
        }
        // Erkennen, wenn der Weg frei ist
        while (sensors.ultrasonic1.distance() >= 40) {
            veraendereGeschwindigkeit(1)
            pause(80 * (ports.LEFTMOTOR.speed() / maxSpeed))
        }
    })
    function bleibStehen() {
        motors.largeAB.run(0)
    }
    brick.buttonEnter.onEvent(ButtonEvent.Pressed, function () {
        maxSpeed = 100
        passeGeschwindigkeitAn()
    })
    brick.buttonDown.onEvent(ButtonEvent.Pressed, function () {
        maxSpeed = 50
        passeGeschwindigkeitAn()
    })
    function passeGeschwindigkeitAn() {
        while (ports.LEFTMOTOR.speed() < maxSpeed && ports.RIGHTMOTOR.speed() < maxSpeed) {
            motors.largeAB.run(ports.LEFTMOTOR.speed() + 1)
            pause(80 * (ports.LEFTMOTOR.speed() / maxSpeed))
        }
        while (ports.LEFTMOTOR.speed() > maxSpeed && ports.RIGHTMOTOR.speed() > maxSpeed) {
            motors.largeAB.run(ports.LEFTMOTOR.speed() - 1)
            pause(60)
        }
    }
    let maxSpeed: number;
    motors.largeAB.run(0)
    maxSpeed = 80
    passeGeschwindigkeitAn()
}
