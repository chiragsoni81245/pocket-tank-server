class AnimationObject {
    constructor() {
        this.isActive = true;
        this.animationSpeed = globalAnimationSpeed;
    }
}

class Weapon extends AnimationObject {
    constructor(posX, posY, type, platform) {
        super();
        this.x = posX;
        this.y = posY;
        this.type = type;
        this.platform = platform;
    }

    draw(c) {
        c.beginPath();
        c.fillStyle = "red";
        c.arc(this.x, this.y, 3, 0, Math.PI * 2, false);
        c.fill();
        c.fillStyle = "black";
        c.closePath();
    }

    async fire(angle, power) {
        // Projectile motion
        const oX = this.x;
        const oY = this.y;
        const speed = this.animationSpeed;
        let timeCounter = 0;
        let new_x = this.x;
        let new_y = this.y;
        const promises = [];

        if (angle == 90) {
            // Case when x does not change
            const maxY =
                Math.pow(power * Math.sin((angle * Math.PI) / 180), 2) /
                (2 * gravity);

            let y = 0;
            let platformDepth = this.platform.getDepthOnX(new_x);
            for (let dy of [1, -1]) {
                while (true) {
                    if (y > maxY) {
                        y -= 2 * dy;
                        break;
                    }
                    if (oY - y > platformDepth) {
                        break;
                    }
                    new_y = oY - y;
                    promises.push(
                        runAfterDelay(
                            (y) => {
                                this.y = y;
                            },
                            (100 / speed) * timeCounter,
                            new_y
                        )
                    );
                    y += dy;
                    timeCounter++;
                }
            }
        } else {
            const coff1 = Math.tan((angle * Math.PI) / 180);
            const coff2 =
                gravity /
                (2 *
                    Math.pow(power, 2) *
                    Math.pow(Math.cos((angle * Math.PI) / 180), 2));

            let x = 0;
            let dx = 1;
            if (angle > 90) {
                dx = -dx;
            }
            while (true) {
                let platformDepth = this.platform.getDepthOnX(new_x);
                let y = x * coff1 - coff2 * Math.pow(x, 2);
                if (oX + x < 0 || oX + x > arena.clientWidth) {
                    break;
                }
                if (oY - y > platformDepth) {
                    new_y = platformDepth;
                    promises.push(
                        runAfterDelay(
                            () => {
                                this.y = platformDepth;
                            },
                            (100 / speed) * timeCounter
                        )
                    );
                    timeCounter++;
                    break;
                }

                new_x = oX + x;
                new_y = oY - y;
                promises.push(
                    runAfterDelay(
                        (x, y) => {
                            this.x = x;
                            this.y = y;
                        },
                        (100 / speed) * timeCounter,
                        new_x,
                        new_y
                    )
                );
                x += dx;
                timeCounter++;
            }
        }

        // Impact Effects
        promises.push(
            runAfterDelay(
                async () => {
                    this.isActive = false;
                    if (new_y === this.platform.getDepthOnX(new_x)) {
                        await this.platform.destroy([new_x, new_y], power);
                    }
                },
                (100 / speed) * timeCounter
            )
        );

        await Promise.all(promises);
        return [new_x, new_y];
    }
}

class Tank extends AnimationObject {
    constructor(posX, posY, platform, size = 2) {
        super();
        this.x = posX;
        this.y = posY;
        this.angle = 30;
        this.power = 50;
        this.platform = platform;
        this.size = size;
        this.weapons = { bomb: 1000 };
        this.nozzleLength = 10;
        this.nozzleWidth = 1;
    }

    draw(c) {
        // Draw Nozzle
        let length = this.nozzleLength;
        let width = this.nozzleWidth;
        c.beginPath();
        c.fillStyle = "blue";
        let points = [
            [this.x, this.y + width],
            [this.x + this.size + length, this.y + width],
            [this.x + this.size + length, this.y - width],
            [this.x, this.y - width],
            [this.x, this.y + width],
        ];
        points = points.map((p) =>
            rotatePoint(p, [this.x, this.y], -(this.angle * Math.PI) / 180)
        );
        c.moveTo(...points[0]);
        for (let point of points.slice(1)) {
            c.lineTo(...point);
        }
        c.fill();
        c.fillStyle = "black";
        c.closePath();

        // Draw Body
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        c.fill();
        c.closePath();
    }

    move(direction, units = 1) {
        if (!["l", "r"].includes(direction)) {
            return False;
        }

        if (direction == "l" && this.x - this.size - units >= 0) {
            this.x -= units;
        }
        if (
            direction == "r" &&
            this.x + this.size + units <= arena.clientWidth
        ) {
            this.x += units;
        }

        this.y = this.platform.getDepthOnX(this.x) - this.size;
    }

    async fire() {
        let weapon_type = Object.keys(this.weapons)[
            Math.floor(Math.random() * Object.keys(this.weapons).length)
        ];
        if (this.weapons[weapon_type] <= 0) {
            console.log(`Insufficient ammo for ${weapon_type}`);
            return false;
        }
        this.weapons[weapon_type] -= 1;
        let weapon = new Weapon(
            ...rotatePoint(
                [this.x + this.size + this.nozzleLength, this.y],
                [this.x, this.y],
                (-this.angle * Math.PI) / 180
            ),
            weapon_type,
            this.platform
        );
        objects.push(weapon);
        await weapon.fire(this.angle, this.power);
        this.move("l", 0);
        return true;
    }
}

class Platform extends AnimationObject {
    constructor(height = 10) {
        super();
        this.height = height;
        this.bezierCurves = [];
        this.curvePointsSaperation = 2;
        let y = arena.clientHeight - this.height;
        for (
            let x = 0;
            x <= arena.clientWidth;
            x += this.curvePointsSaperation
        ) {
            this.bezierCurves.push([
                [x, y],
                [x + this.curvePointsSaperation / 2, y],
                [x + this.curvePointsSaperation, y],
            ]);
        }
    }

    getDepthOnX(x) {
        let currentCruve =
            this.bezierCurves[
                binarySearch(this.bezierCurves, x, (v) => v[0][0])
            ];
        let currentPointOnCurve =
            currentCruve[binarySearch(currentCruve, x, (v) => v[0])];
        return currentPointOnCurve[1];
    }

    async destroy(impactPoint, impact) {
        let promises = [];
        let speed = this.animationSpeed;
        let left_curve = binarySearch(
            this.bezierCurves,
            impactPoint[0] - impact,
            (v) => v[0][0]
        );
        let right_curve = binarySearch(
            this.bezierCurves,
            impactPoint[0] + impact,
            (v) => v[0][0]
        );
        for (let i = left_curve; i <= right_curve; i++) {
            for (let j = 0; j < 3; j++) {
                if (
                    this.bezierCurves[i][j][0] >= impactPoint[0] - impact &&
                    this.bezierCurves[i][j][0] <= impactPoint[0] + impact
                ) {
                    let impactEffect = Math.sqrt(
                        Math.pow(impact, 2) -
                            Math.pow(
                                Math.abs(
                                    impactPoint[0] - this.bezierCurves[i][j][0]
                                ),
                                2
                            )
                    );
                    if (
                        this.bezierCurves[i][j][1] <
                        impactPoint[1] + impactEffect
                    ) {
                        let timeCounter = 0;
                        for (
                            let currImpact = 0;
                            currImpact <= impactEffect;
                            currImpact++
                        ) {
                            promises.push(
                                runAfterDelay(
                                    () => {
                                        this.bezierCurves[i][j][1] = Math.min(
                                            arena.clientHeight,
                                            impactPoint[1] + currImpact
                                        );
                                    },
                                    (100 / speed) * timeCounter
                                )
                            );
                            timeCounter++;
                        }
                    }
                }
            }
        }

        await Promise.all(promises);
    }

    draw(c) {
        c.beginPath();
        c.fillStyle = "green";
        c.moveTo(...this.bezierCurves[0][0]);
        for (let curve of this.bezierCurves) {
            c.bezierCurveTo(...curve.flat());
        }
        c.lineTo(arena.clientWidth, arena.clientHeight);
        c.lineTo(0, arena.clientHeight);
        c.lineTo(0, arena.clientHeight - this.height);
        c.closePath();
        c.fill();
        c.fillStyle = "black";

        if (!false) {
            for (let curve of this.bezierCurves) {
                for (let point of curve) {
                    c.beginPath();
                    c.arc(...point, 3, 0, Math.PI * 2, false);
                    c.fill();
                    c.closePath();
                }
            }
        }
    }
}
