function binarySearch(arr, x, valueResolver) {
    if (!valueResolver) {
        valueResolver = (v) => v;
    }
    let l = 0;
    let r = arr.length - 1;

    while (l <= r) {
        let mid = Math.floor(l + (r - l) / 2);

        if (valueResolver(arr[mid]) === x) {
            return mid;
        } else if (valueResolver(arr[mid]) > x) {
            r = mid - 1;
        } else {
            l = mid + 1;
        }
    }

    return Math.min(l, arr.length - 1);
}

function rotatePoint(point, center, angle) {
    let dx = point[0] - center[0];
    let dy = point[1] - center[1];
    let new_x = Math.cos(angle) * dx - Math.sin(angle) * dy + center[0];
    let new_y = Math.sin(angle) * dx + Math.cos(angle) * dy + center[1];
    return [new_x, new_y];
}

function runAfterDelay(func, delay, ...args) {
    return new Promise((resolve) => {
        setTimeout(
            async () => {
                await func(...args);
                resolve();
            },
            delay,
            ...args
        );
    });
}
