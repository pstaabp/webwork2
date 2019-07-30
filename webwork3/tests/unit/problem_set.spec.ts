import ProblemSet from '@/models/ProblemSet';

const theProb = new ProblemSet({set_id: 'test'});
const params = theProb.defaults();


describe('Problem class tests', () => {
  test('correct constructor', () => {
    const prob = new ProblemSet({set_id: 'test'});
    Object.assign(params, {set_id: 'test'});
    expect(prob.getAttributes()).toEqual(params);
  });

  test('construct an illegal field', () => {
    expect( () => {
      const prob_set = new ProblemSet({set_id: 'test', name: 'set_id'});
      // tslint:disable-next-line
      console.log(prob_set);
    }).toThrow();
  });

  test('get a field', () => {
    const prob = new ProblemSet({set_id: 'test'});
    expect(prob.get('set_id')).toEqual('test');
  });

  test('set a field', () => {
    const prob = new ProblemSet({set_id: 'test'});
    prob.set('set_id', 'test2');
    Object.assign(params, {set_id: 'test2'});
    expect(prob.getAttributes()).toEqual(params);
  });

  test('set an illegal field', () => {
    const prob = new ProblemSet({set_id: 'test'});
    expect( () => {
      prob.set('not_a_field', 10);
    }).toThrow();
  });

  test('make sure set_id is present in the constructor', () => {
    expect( () => {
      const ps = new ProblemSet();
      // tslint:disable-next-line
      console.log(ps);
    }).toThrow();
  });

  test('make sure that the changed object is working', () => {
    const prob = new ProblemSet({set_id: 'test'});
    prob.set('open_date', 1000);
    const _ch = prob.getChanges();
    expect(_ch).toEqual({open_date: {_old: 0, _new: 1000}});
  });

  test('parse an object to create a problem set,', () => {
    const attrs = {
      set_id: 'test',
      open_date: '123',
      due_date: '234',
    };
    const prob_set = new ProblemSet(attrs, {parse: true});

    const parsed_attributes = {};
    Object.assign(parsed_attributes, prob_set.defaults(), {
      set_id: 'test',
      open_date: 123,
      due_date: 234,
    });
    expect(prob_set.getAttributes()).toEqual(parsed_attributes);
  });

  test('check that a nonvalid date throws an error', () => {
    const attrs = {
      set_id: 'test',
      open_date: '123',
      due_date: '-234',
    };
    expect( () => {
      const prob_set = new ProblemSet(attrs, {parse: true});
      // tslint:disable-next-line
      console.log(prob_set);
    }).toThrow();
  });

  test('check that a nonvalid set_id throws an error', () => {
    expect( () => {
      const prob_set = new ProblemSet({set_id: '12HW'});
      // tslint:disable-next-line
      console.log(prob_set);
    }).toThrow();
  });

  test('Check that if we set parse to false in creating a set that an error is not thrown', () => {
   expect ( () => {
     const prob_set = new ProblemSet({set_id: '12HW'}, {parse: false});
   }).not.toThrow();
 });


});
