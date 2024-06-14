/**
 * tracks how many people are interacting with the algorithm
 */
export class FloorTracker {
  /**
   * stores how many people want to enter the lift
   * each number is the number of floor on which a person wants to get in
   */
  public peopleWaiting: number[];
  /**
   * stores how many people are expected to arrive at a given floor
   * each number is the number of floor on which a person wants to leave the lift
   */
  public peopleExpected: number[];

  constructor(N: number) {
    this.peopleWaiting = Array(N).fill(0);
    this.peopleExpected = Array(N).fill(0);
  }
}
