# Hello!
## welcome to my assignment for my internship at AVSystem.

## Table of contents

1. [Observations](#observations)
2. [My Goals](#my-goals)
3. [Project structure](#project-structure)
4. [Algorithm's details](#algorithms-details)
5. [Run the web app](#run-the-web-app)
6. [Use the web app](#use-the-web-app)
6. [Run the project in the command line](#run-the-project-in-the-command-line)
6. [Import the project in code](#import-the-project-in-code)
7. [If I had more time...](#if-i-had-more-time)


## Observations

Before starting to code I made a list of observations related to elevators in general:

1. usually, people have a routine:

- in the morning people go down to floor zero so as to i.e. go to work
- during the day the traffic is mixed, some people go up, some go down
- in the evening poeple return home and go up to their flats

2. the above schema is also true for offices but works in a reverse order
3. there are several frustrations when using elevators:

- waiting too long for the elevator to arrive
- going up to fetch another person before descending to the desired floor
- not being able to enter an elevator that is full of people

## My goals

For the project I decided to code a solution in Typescript that:

1. addresses all of the above observations
2. Works both in a NodeJS and a browser environment
3. has a nice web UI

## Project structure

The project consists of 3 parts:

1. the actual agorithm located in ./src/algorithm
2. A React + Material UI + Vite web app that allows to use the algo in the browser
3. A sample test suite for playing with the algo though the command line

## Algorithm's details

The full algorithm sports comments explaining each part of the code, it is located in ./src/algorithm

The most important components of the algo:

### Call class - models/Call.ts

it symbolises a request of a passenger. There are 2 types of calls:

- entryCall - on which floor a person wants to enter the elevator
- exitCall - on which floor a person wants to exit the elevator

A call also has a direction, either up or down

Moreover, there are 3 possible priorities:

1. Priority 0 (served first) - the person is waiting above the elevator and the elvetor is going pu
2. Priority 1 - the person wants to go down and the elevator is going down
3. Priority 2 (served lasst) - the person wants to go up but is below the elevator and the elevator is going down

### The scheduler - scheduler/index.ts

The function that allocates elevators to the waiting passengers. It simulates how long it would take each elevator to get to the wainting passenger and chooses the lift with the shortest time

### The elevator logic - models/Elevator.ts

The way the elevator chooses which calls to serve and in what order is handled with a priority heap queue (defined in utils/PriorityQueue.ts) which keeps the most important requests at the top. The elevator serves calls one by one but I can also resove similar requests at the sime time ( it knows that several people can enter or leave the elevator at the same time).

The elevator can follow 2 different stratiegies while staying idle and waiting:

1. The BEFORE_ADTERNOON stategy - during this part of the day poeple usually go down in order to leave the building, therefore the elevators, when idle are spreaded evenly around different floors. Thanks to this displacement they can handle plenty of traffic from various floors
2. The AFTER_ADTERNOON stategy - during this part of the day poeple usually return home and go up the floor to their flats, therefore the elevators, wait for the on floor zero.

Please, feel invited to view the full code in ./src/algorithm 

## Run the web app

1. Install NodeJS v20 or newer
2. Install dependencies

```bash
$ npm i
```

3. start the dev server

```bash
$ npm run dev
```

4. build the app

```bash
$ npm run build
```


## Use the web app

<img width="795" alt="Screenshot 2024-06-14 at 01 19 21" src="https://github.com/Matb85/AVsystem-home-assignment/assets/69219238/0ea5048b-cba3-4696-9e84-5e1ac817c1a3">

Features of the web app
- can handle as many elevators and as many floor as you'd like
- allows to change most of the algortihm's settings

The structure of the web app:

1. The canvas
   - it is a html table that has 3 + n columns, where n is the number of elvators
   - the 1st column shows the number of the floor
   - the 2nd column shows how many poeple are waiting for an elvator on each floor
   - the 3rd-(3+n-1)st columns show where each elevator currently is
   - the las column shows how many people are expected of arrive on each floor
2. The sidebar
   - allows to start, stop and reset the algorithm
   - allows to generate passengers (also automatically)
   - allows to change the algorithm's settings (click the button to actually apply the settings)

  
## Run the project in the command line

Inside ./src/algorithm/index.test.ts there is a sample test wher eone can easily play with the algo through the command line

1. Install NodeJS v20 or newer
2. Install dependencies

```bash
$ npm i
```

3. Run index.test.ts

```bash
$ npm run test
```

## Import the project in code

1. import the ElevatorSystem class and craete and instance

```typescript
import { ElevatorSystem } from "./src/algorithm";

const building = new ElevatorSystem();

```

2. Specify how many floor you want

```typescript
const numberOfFloors = 20

building.setFloors(numberOfFloors);
```

3. Specify how many elevators you want and create a config for the elevators


```typescript
import { type ElevatorConfigI, type DisplayDataI } from "./src/algorithm";

const numberOfElevators = 3

async function displayElevator(d: DisplayDataI): Promise<void> {
  console.log(d)
}

const config: ElevatorConfigI = {
  loadingTime: 300,
  unloadingTime: 300,
  velocity: 1,
  capacity: 8,
  interFloorHeight: 3,
  animate: displayElevator, // a function that displays 
};

building.setElevators(numberOfElevators, config);
```

4. Choose a stategy

```typescript
import { Strategies } from "./src/algorithm/utils";

building.setStrategy(Strategies.BEFORE_AFTERNOON); // Sets algorithm in the main class

```

5. Finally, start generating passengers

```typescript
building.generatePassenger(10, 0); // from floor 10 to floor 0 
```

## If I had more time...

I would add...

1. proper unit tests for functions inside alogrithm/models/Elevator.ts, alogrithm/index.ts, alogrithm/utils.ts
2. proper black box integration tests for the algorithm
3. code coverage tests
4. prettier UI
5. responsive design for mobile devices
6. support for floors below zero (i.e. underground parking lots)
7. E2E tests for the web app
