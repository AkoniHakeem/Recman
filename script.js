const generate52Weeks = () => {
    let weeksArray = []

    for(let i = 1; i <= 52; i++) {
        const week = `week ${i}`;
        weeksArray.push(week)
    }

    return weeksArray;
}

// console.log(generate52Weeks())

/* 
[
  'week 1',  'week 2',  'week 3', 'week 4', 
  'week 5',  'week 6', 'week 7', 'week 8',
  'week 9',  'week 10', 'week 11', 'week 12',
  'week 13', 'week 14', 'week 15', 'week 16',
  'week 17', 'week 18', 'week 19', 'week 20',
  'week 21', 'week 22', 'week 23', 'week 24',
  'week 25', 'week 26', 'week 27', 'week 28',
  'week 29', 'week 30', 'week 31', 'week 32',
  'week 33', 'week 34', 'week 35', 'week 36',
  'week 37', 'week 38', 'week 39', 'week 40',
  'week 41', 'week 42', 'week 43', 'week 44',
  'week 45', 'week 46', 'week 47', 'week 48',
  'week 49', 'week 50', 'week 51', 'week 52'
]
*/

let getNextCyclePosition = (cycleType, currentCyclePosition) => {
    const cycles = {
        "weekly" : [
            'week 1',  'week 2',  'week 3', 'week 4', 
            'week 5',  'week 6', 'week 7', 'week 8',
            'week 9',  'week 10', 'week 11', 'week 12',
            'week 13', 'week 14', 'week 15', 'week 16',
            'week 17', 'week 18', 'week 19', 'week 20',
            'week 21', 'week 22', 'week 23', 'week 24',
            'week 25', 'week 26', 'week 27', 'week 28',
            'week 29', 'week 30', 'week 31', 'week 32',
            'week 33', 'week 34', 'week 35', 'week 36',
            'week 37', 'week 38', 'week 39', 'week 40',
            'week 41', 'week 42', 'week 43', 'week 44',
            'week 45', 'week 46', 'week 47', 'week 48',
            'week 49', 'week 50', 'week 51', 'week 52'
          ],
        "monthly" : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    }
    let positionIndex  = cycles[cycleType].findIndex(x => x.toLowerCase()===currentCyclePosition.toLowerCase())
    let nextPositionIndex = positionIndex + 1 >= cycles.length ? 0 : positionIndex + 1;
    let nextCyclePosition = cycles[cycleType][nextPositionIndex];
    return nextCyclePosition;
}

// console.log(getNextCyclePosition("weekly", ""));

const getYear = () => {
    let year = 2021;
    return ++year;
}

getCurrentYear = () => {
    return new Date().getFullYear()
}

console.log(getCurrentYear())

