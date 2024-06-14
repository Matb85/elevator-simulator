import type { Call } from "@/models/Call";

/**
 * Sorts calls based on passage and floor number
 */
function callComparator(x: Call, y: Call) {
  // -1 The element pointed by x goes before the element pointed by y
  // 0  The element pointed by x is equivalent to the element pointed by y
  // 1 The element pointed by x goes after the element pointed by y

  // If x or y are up-peak calls
  if (x.isSpecialCall() || y.isSpecialCall()) {
    if (x.isSpecialCall() && !y.isSpecialCall()) {
      return -1;
    } else if (!x.isSpecialCall() && y.isSpecialCall()) {
      return 1;
    } else {
      return 0;
    }
  }

  if (x.getPassage() == y.getPassage()) {
    if (x.getPassage() == 1 || x.getPassage() == 3) {
      if (x.getFloor() < y.getFloor()) {
        return -1;
      } else if (x.getFloor() > y.getFloor()) {
        return 1;
      }

      return 0;
    } else if (x.getPassage() == 2) {
      if (x.getFloor() > y.getFloor()) {
        return -1;
      } else if (x.getFloor() < y.getFloor()) {
        return 1;
      }

      return 0;
    }
  } else if (x.getPassage() > y.getPassage()) {
    return 1;
  }

  return -1;
}

const parent = (i: number) => ((i + 1) >>> 1) - 1;
const left = (i: number) => (i << 1) + 1;
const right = (i: number) => (i + 1) << 1;

/**
 * a basic Priority Heap queue implementation
 */
export class CallPriorityQueue {
  private _heap: Call[];
  top: number = 0;
  constructor() {
    this._heap = [];
  }

  public size(): number {
    return this._heap.length;
  }

  public getHeap(): Call[] {
    return this._heap;
  }

  public isEmpty(): boolean {
    return this.size() == 0;
  }

  public peek(): Call {
    return this._heap[this.top];
  }

  public push(...calls: Call[]) {
    calls.forEach(call => {
      this._heap.push(call);
      this._siftUp();
    });
    return this.size();
  }

  public remove(call: Call) {
    for (let i = 0; i < this.size(); i++) {
      if (this._heap[i].getID() == call.getID() && this._heap[i].getType() == call.getType()) {
        this._heap.splice(i, 1);
        break;
      }
    }
    this._siftDown();
  }

  public pop() {
    const poppedValue = this.peek();
    const bottom = this.size() - 1;
    if (bottom > this.top) {
      this._swap(this.top, bottom);
    }
    this._heap.pop();
    this._siftDown();
    return poppedValue;
  }

  private _greater(i: number, j: number) {
    return callComparator(this._heap[i], this._heap[j]) == -1;
  }

  private _swap(i: number, j: number) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }
  private _siftUp() {
    let node = this.size() - 1;
    while (node > this.top && this._greater(node, parent(node))) {
      this._swap(node, parent(node));
      node = parent(node);
    }
  }

  private _siftDown() {
    let node = this.top;
    while (
      (left(node) < this.size() && this._greater(left(node), node)) ||
      (right(node) < this.size() && this._greater(right(node), node))
    ) {
      const maxChild = right(node) < this.size() && this._greater(right(node), left(node)) ? right(node) : left(node);
      this._swap(node, maxChild);
      node = maxChild;
    }
  }
}
