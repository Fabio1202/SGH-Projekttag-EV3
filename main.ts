//% color="#2267d6" icon="\uf10d" block="SGH"
namespace Autonom {
    let speedRight: number;
    let speedLeft: number;
    let maxSpeed: number;

    let limitHighway: number;
    let limitStreet: number;

    let street: limits;

    let ports = {
        LEFTMOTOR: motors.largeA,
        RIGHTMOTOR: motors.largeB,
        ULTRAMOTOR: motors.mediumD,
        FRONTULTRA: sensors.ultrasonic1,
        SIDEULTRA: sensors.ultrasonic2,
        COLORSENSOR: sensors.color3,
        LIGHTSENSOR: sensors.color4
    }

    let colors = {
        AUTOBAHN: ColorSensorColor.Blue,
        LANDSTRASSE: ColorSensorColor.Red,
        KREUZUNG: ColorSensorColor.Yellow,
        PARKPLATZ: ColorSensorColor.Brown,
        PARKPLATZ_EINFAHRT: ColorSensorColor.Green,
        STRASSENLINIE: ColorSensorColor.Black,
        BODEN: ColorSensorColor.White
    }

    //% block
    export const enum limits {
        AUTOBAHN,
        LANDSTRASSE
    }

    //
    // Ab hier Methodenaufrufe
    //

    init();

    //
    // Ab hier Methoden
    //

    function init() {
        let ports = {
            LEFTMOTOR: motors.largeA,
            RIGHTMOTOR: motors.largeB,
            ULTRAMOTOR: motors.mediumD,
            FRONTULTRA: sensors.ultrasonic1,
            SIDEULTRA: sensors.ultrasonic2,
            COLORSENSOR: sensors.color3,
            LIGHTSENSOR: sensors.color4
        }

        limitHighway = Math.randomRange(60, 80);
        limitStreet = Math.randomRange(30, 50);

        setLimit(limits.LANDSTRASSE);
    }

    ports.FRONTULTRA.onEvent(UltrasonicSensorEvent.ObjectDetected, function () {
        if (street == limits.LANDSTRASSE) {
            kollisionsErkennungStrasse();
        } else if (street == limits.AUTOBAHN) {

        }
    })

    function kollisionsErkennungAutobahn() {
        //Erkennen, wenn der Weg frei ist
        while (ports.FRONTULTRA.distance() >= 40 && street == limits.AUTOBAHN) {
            veraendereGeschwindigkeit(1)
            pause(80 * (ports.LEFTMOTOR.speed() / maxSpeed))
        }
    }

    function kollisionsErkennungStrasse() {
        // Kollisionserkennung
        while (ports.FRONTULTRA.distance() <= 30 && street == limits.LANDSTRASSE) {
            if (ports.FRONTULTRA.distance() <= 7) {
                bleibStehen()
            } else if (ports.FRONTULTRA.distance() <= 15) {
                veraendereGeschwindigkeit(-10)
            } else {
                veraendereGeschwindigkeit(-1)
            }
            pause(60);
        }
        // Erkennen, wenn der Weg frei ist
        while (ports.FRONTULTRA.distance() >= 40 && street == limits.LANDSTRASSE) {
            veraendereGeschwindigkeit(1)
            pause(80 * (ports.LEFTMOTOR.speed() / maxSpeed))
        }
    }

    function bleibStehen() {
        motors.largeAB.run(0)
    }

    function passeGeschwindigkeitAn() {
        while (ports.LEFTMOTOR.speed() < maxSpeed && ports.RIGHTMOTOR.speed() < maxSpeed) {
            veraendereGeschwindigkeit(1);
            pause(80)
        }
        while (ports.LEFTMOTOR.speed() > maxSpeed && ports.RIGHTMOTOR.speed() > maxSpeed) {
            veraendereGeschwindigkeit(-1);
            pause(60)
        }
    }

    //
    // Beginn der Blöcke
    //

    //% block="Verändere Geschwindigkeit um $num"
    export function veraendereGeschwindigkeit(num: number) {
        //Linker Motor
        if (ports.LEFTMOTOR.speed() + num >= 0 && ports.LEFTMOTOR.speed() + num <= maxSpeed) {
            ports.LEFTMOTOR.run(ports.LEFTMOTOR.speed() + num)
        } else if (ports.LEFTMOTOR.speed() + num < 0) {
            ports.LEFTMOTOR.run(0);
        } else {
            ports.LEFTMOTOR.run(maxSpeed);
        }

        //Rechter Motor
        if (ports.RIGHTMOTOR.speed() + num >= 0 && ports.RIGHTMOTOR.speed() + num <= maxSpeed) {
            ports.RIGHTMOTOR.run(ports.RIGHTMOTOR.speed() + num)
        } else if (ports.RIGHTMOTOR.speed() + num < 0) {
            ports.RIGHTMOTOR.run(0);
        } else {
            ports.RIGHTMOTOR.run(maxSpeed);
        }
    }

    //% block="Wenn $farbe erkannt wird"
    export function onColorDetect(farbe: ColorSensorColor, handler: () => void) {
        init();
        ports.COLORSENSOR.onColorDetected(ColorSensorColor.Blue, handler);
    }

    //% block="Einparken"
    export function park() {

    }

    //% block="Setze Geschwindigkeitsbegrenzung auf $lim"
    export function setLimit(lim: limits) {
        if (lim = limits.AUTOBAHN) {
            maxSpeed = limitHighway;
            street = limits.AUTOBAHN;
        } else if (lim = limits.LANDSTRASSE) {
            maxSpeed = limitStreet;
            street = limits.LANDSTRASSE;
        }
        passeGeschwindigkeitAn();
    }

}

Autonom.onColorDetect(ColorSensorColor.Blue, function () {
    console.log("Test")
    Autonom.setLimit(Autonom.limits.AUTOBAHN)
})
