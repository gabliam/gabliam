export function hasMetadata(key, target) {
    try {
        return Reflect.hasOwnMetadata(key, target);
    } catch (e) {
        return false;
    }
}
