// preserve original Date in case some test needs it
(global as any).OriginalDate = Date;

// the day 17.live was born
const constantDate = new Date('2017-07-05');

class MockDate extends Date {
  constructor() {
    super();
    return constantDate;
  }

  static now() {
    return constantDate.getTime();
  }
}

(global as any).Date = MockDate;
