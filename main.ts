//% color="#2267d6" icon="\uf10d" block="SGH"
namespace Autonom {
    let speedRight: number;
    let speedLeft: number;
    let maxSpeed: number;

    let limitHighway: number;
    let limitStreet: number;

    let street: limits;

    let colorConditionBlack: number;

    let currentCrossState = false;
    let currentCrossStateOnTurn = false;
    let turnLeftSecondYellow = false;

    let nextCrossChoices: number[];
    nextCrossChoices = [];

    let ports = {
        LEFTMOTOR: motors.largeA,
        RIGHTMOTOR: motors.largeB,
        ULTRAMOTOR: motors.mediumD,
        FRONTULTRA: sensors.ultrasonic1,
        SIDEULTRA: sensors.ultrasonic2,
        COLORSENSOR: sensors.color3,
        LIGHTSENSOR: sensors.color4
    }

    export enum colors {
        AUTOBAHN = ColorSensorColor.Blue,
        LANDSTRASSE = ColorSensorColor.Red,
        KREUZUNG = ColorSensorColor.Yellow,
        PARKPLATZ_EINFAHRT = ColorSensorColor.Green,
    }

    export enum crossingColor {
        RIGHT,
        LEFT,
        STRAIGHT
    }

    export const enum limits {
        AUTOBAHN,
        LANDSTRASSE
    }

    let errorMessages = {
        "3001": "FATAL ERROR: Es wurde eine Farbe an einer Kreuzung erkannt, welche zu einem irreführenden Ergebniss führte. Der Brick hat sich zum Schutze selber ausgeschaltet."
    }

    //
    // Ab hier Methodenaufrufe
    //

    init();

    //
    // Ab hier Methoden
    //

    function init() {
        limitHighway = Math.randomRange(27, 35);
        limitStreet = Math.randomRange(10, 20);

        colorConditionBlack = 25;

        setLimit(limits.LANDSTRASSE);
    }

    ports.FRONTULTRA.onEvent(UltrasonicSensorEvent.ObjectDetected, function () {
        if (street == limits.LANDSTRASSE) {
            kollisionsErkennungStrasse();
        } else if (street == limits.AUTOBAHN) {
            kollisionsErkennungStrasse()
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
        ports.LEFTMOTOR.stop();
        ports.RIGHTMOTOR.stop();
    }

    function passeGeschwindigkeitAn() {
        while (ports.LEFTMOTOR.speed() < maxSpeed && ports.RIGHTMOTOR.speed() < maxSpeed) {
            veraendereGeschwindigkeit(1);
            pause(80 * (ports.LEFTMOTOR.speed() / maxSpeed))
        }
        while (ports.LEFTMOTOR.speed() > maxSpeed && ports.RIGHTMOTOR.speed() > maxSpeed) {
            veraendereGeschwindigkeit(-1);
            pause(60)
        }
    }

    function changeSpeedLeft(num: number) {
        if (ports.LEFTMOTOR.speed() + num >= 0 && (ports.LEFTMOTOR.speed() + num <= maxSpeed || num < 0)) {
            ports.LEFTMOTOR.run(ports.LEFTMOTOR.speed() + num)
        } else if (ports.LEFTMOTOR.speed() + num < 0) {
            bleibStehen();
        } else {
            ports.LEFTMOTOR.run(maxSpeed);
        }
    }

    function changeSpeedRight(num: number) {
        if (ports.RIGHTMOTOR.speed() + num >= 0 && (ports.RIGHTMOTOR.speed() + num <= maxSpeed || num < 0)) {
            ports.RIGHTMOTOR.run(ports.RIGHTMOTOR.speed() + num)
        } else if (ports.RIGHTMOTOR.speed() + num < 0) {
            bleibStehen();
        } else {
            ports.RIGHTMOTOR.run(maxSpeed);
        }
    }

    function crossingRight() {
        let angle = ports.LEFTMOTOR.angle();
        while (ports.LEFTMOTOR.angle() - angle < 450) {
            ports.RIGHTMOTOR.stop();
        }
        ports.RIGHTMOTOR.run(ports.LEFTMOTOR.speed());
    }

    function crossingLeft() {
        let angle = ports.RIGHTMOTOR.angle();
        while (ports.RIGHTMOTOR.angle() - angle < 450) {
            ports.LEFTMOTOR.stop();
        }
        ports.LEFTMOTOR.run(ports.RIGHTMOTOR.speed());
    }

    function crossColorDetect(color: colors) {
        if (color == colors.AUTOBAHN) {
            nextCrossChoices.push(crossingColor.RIGHT)
        } else if (color == colors.LANDSTRASSE) {
            nextCrossChoices.push(crossingColor.LEFT)
        } else if (color == colors.PARKPLATZ_EINFAHRT) {
            nextCrossChoices.push(crossingColor.STRAIGHT)
        } else {
            triggerError("3001");
        }
    }

    function triggerError(e: string) {
        bleibStehen();
        brick.setStatusLight(StatusLight.RedFlash);
        console.sendToScreen();
        console.log("Error Code: " + e);
        while (!brick.buttonEnter.isPressed()) {
            music.playSoundEffectUntilDone(sounds.informationErrorAlarm);
            bleibStehen();
            control.panic(parseInt(e));
        }
    }

    //
    // Beginn der Blöcke
    //

    //% block="Verändere Geschwindigkeit um $num"
    export function veraendereGeschwindigkeit(num: number) {
        //Linker Motor
        changeSpeedLeft(num);
        //Rechter Motor
        changeSpeedRight(num);
    }

    //% block="Neue Kreuzung?"
    export function newCrossing(): boolean {
        return !currentCrossState;
    }

    //% block="Wenn $farbe erkannt wird"
    export function onColorDetect(farbe: colors, handler: () => void) {
        ports.COLORSENSOR.onColorDetected(farbe, function () {
            if (currentCrossState == true && farbe != colors.KREUZUNG) {
                crossColorDetect(farbe);
            } else {
                handler();
            }
        });
    }

    //% block="Rechte Fahrbahnbegrenzung erkannt"
    export function onBorderCrossRight(handler: () => void) {
    }

    //% block="Linke Fahrbahnbegrenzung erkannt"
    export function onBorderCrossLeft(handler: () => void) {
    }

    //% block="Lenke links"
    export function turnLightLeft() {

    }




    //% block="Anstehende Kreuzung erkannt"
    export function crossingDetected() {
        currentCrossState = true;
    }

    //% block="Biege an einer Kreuzung ab"
    export function crossingTurn() {
        if (currentCrossStateOnTurn == false) {
            if (nextCrossChoices.length != 0) {
                let nextCrossChoice = nextCrossChoices[Math.randomRange(0, nextCrossChoices.length - 1)];
                console.log(nextCrossChoice.toString());
                currentCrossStateOnTurn = true;
                if (nextCrossChoice == 0) {
                    crossingRight()
                } else if (nextCrossChoice == 1) {
                    while (ports.COLORSENSOR.color() != ColorSensorColor.White) {

                    }
                    while (ports.COLORSENSOR.color() != ColorSensorColor.Yellow) {

                    }
                    crossingLeft()
                }
                currentCrossStateOnTurn = false;
            } else {
                triggerError("3002")
            }
            nextCrossChoices = [];
            currentCrossState = false;
        }
    }

    //% block="Einparken"
    export function park() {

    }

    //% block="Setze Geschwindigkeitsbegrenzung auf $lim"
    export function setLimit(lim: limits) {
        if (lim == limits.AUTOBAHN) {
            maxSpeed = limitHighway;
            street = limits.AUTOBAHN;
        } else if (lim == limits.LANDSTRASSE) {
            maxSpeed = limitStreet;
            street = limits.LANDSTRASSE;
        }
        passeGeschwindigkeitAn();
    }

}
