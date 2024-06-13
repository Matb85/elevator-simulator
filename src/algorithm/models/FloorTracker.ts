export class FloorTracker {
  public peopleWaiting: number[];
  public peopleExpected: number[];

  constructor(N: number) {
    this.peopleWaiting = Array(N).fill(0);
    this.peopleExpected = Array(N).fill(0);
  }
}
