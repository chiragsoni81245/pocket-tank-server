function animate() {
    requestAnimationFrame(animate);
    context.clearRect(0, 0, arena.clientWidth, arena.clientHeight);
    for (let obj of objects) {
        obj.draw(context);
    }
    objects = objects.filter((o) => o.isActive);
}

function main() {
    const platformHeight = 150;
    const tankSize = 15;
    const tankStart = tankSize + 400;

    let platform = new Platform(platformHeight);
    objects.push(platform);

    let tank = new Tank(
        tankStart,
        arena.clientHeight - tankSize - platformHeight,
        platform,
        tankSize
    );
    objects.push(tank);

    // Movement Logic
    document.addEventListener("keydown", (e) => {
        let unit = 5;
        if (e.key === "ArrowLeft") {
            tank.move("l", unit);
        } else if (e.key === "ArrowRight") {
            tank.move("r", unit);
        } else if (e.key === "ArrowUp") {
            if (tank.angle >= 0 && tank.angle <= 180 - unit) {
                tank.angle += unit;
            }
        } else if (e.key === "ArrowDown") {
            if (tank.angle >= unit && tank.angle <= 180) {
                tank.angle -= unit;
            }
        } else if (e.key === " ") {
            tank.fire();
        }
    });
    // End

    animate();
}

main();
