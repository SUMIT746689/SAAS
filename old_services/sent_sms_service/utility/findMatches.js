export const findMatches = (inputString) => {
    let pattern = /#(.*?)#/g;

    const allMatches = [...inputString.matchAll(pattern)].map(v => v[1]);
    const allUniqueMatches = [...new Set(allMatches)]
    return allUniqueMatches;
}