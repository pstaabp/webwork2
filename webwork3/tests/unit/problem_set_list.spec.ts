import ProblemSet from '@/models/ProblemSet';
import ProblemSetList from '@/models/ProblemSetList';

describe('Test ProblemSetList', () => {
  test('test the empty ProblemSetList constructor', () => {
    const problemSets = new ProblemSetList();
  });

  test('Create a list using an array of items', () => {
    const sets: ProblemSet[] = [
      new ProblemSet({set_id: 'set1'}),
      new ProblemSet({set_id: 'set2'}),
      new ProblemSet({set_id: 'set3'}),
    ];
    const setList = new ProblemSetList(sets);
    expect(setList.size()).toEqual(3);
  });

  const theSetList = new ProblemSetList([
        new ProblemSet({set_id: 'set1'}),
        new ProblemSet({set_id: 'set2'}),
        new ProblemSet({set_id: 'set3'}),
      ]);

  test('add a new set to the set list', () => {

    const problemSet = new ProblemSet({set_id: 'set4'});
    theSetList.add(problemSet);
    expect(theSetList.size()).toEqual(4);
  });

  test('check that a List of ProblemSet without unique ids throws an error', () => {
    const sets: ProblemSet[] = [
      new ProblemSet({set_id: 'set1'}),
      new ProblemSet({set_id: 'set2'}),
      new ProblemSet({set_id: 'set2'}),
    ];
    expect( () => {
      const psl = new ProblemSetList(sets);
      // tslint:disable-next-line
      console.log(psl);
    }).toThrow();

  });

  test('try to add a problem set with a duplicated id', () => {
    expect( () => {
      theSetList.add(new ProblemSet({set_id: 'set1'}));
    }).toThrow();
  });

  test('set the properties of one of the given sets', () => {
    const problemSet = new ProblemSet({set_id: 'set1', due_date: 100});
    const updatedSet = theSetList.set(problemSet);
    const attrs: object = {};
    Object.assign(attrs, problemSet.defaults(), {set_id: 'set1', due_date: 100});
    expect(updatedSet.getAttributes()).toEqual(attrs);
  });

  test('try to set the properties of a set that is not in the set list', () => {
    const probSet = new ProblemSet({set_id: 'set9', due_date: 100});
    expect( () => {
      theSetList.set(probSet);
    }).toThrow();
  });

  test('remove a problem set from the set list', () => {
    theSetList.remove(new ProblemSet({set_id: 'set1'}));
    expect(theSetList.map( (_set) => _set.getID())).toEqual(['set2', 'set3', 'set4']);
  });

  test('try to remove a problem set from the set list that doesn\'t exist', () => {
    expect( () => {
      theSetList.remove(new ProblemSet({set_id: 'setX'}));
    }).toThrow();
  });
});
