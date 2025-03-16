export function removeSpaces(content) {
    return content
        .trim()
        .split('\n')
        .map((item) => item.trim())
        .filter((item) => item)
        .join(' ');
}
