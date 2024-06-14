# Hello, <!-- omit from toc -->

Welcome to my assignment for internship at AVSystem!

I'm Mateusz Bis and I have been asked to create this project. The recruiters, I believe, know the description of task very well, therefore I didn't paste it here. Below you cen read about my thought process, observations, goals, results and about how to use the project. Also, please, feel invited to browse all the code in the repository.

## Table of contents<!-- omit from toc -->

- [Observations](#observations)
- [My goals](#my-goals)
- [Project structure](#project-structure)
- [Algorithm's details](#algorithms-details)
  - [Call class - models/Call.ts](#call-class---modelscallts)
  - [The scheduler - scheduler/index.ts](#the-scheduler---schedulerindexts)
  - [The elevator logic - models/Elevator.ts](#the-elevator-logic---modelselevatorts)
- [Run the web app](#run-the-web-app)
- [Use the web app](#use-the-web-app)
- [Run the project on the command line](#run-the-project-on-the-command-line)
- [Import the project in code](#import-the-project-in-code)
- [If I had more time...](#if-i-had-more-time)

## Observations

Before starting to code, I made a list of observations related to elevators in general:

1. usually, people have a routine:

- in the morning, people go down to floor zero to i.e. go to work
- during the day the traffic is mixed, some people go up, some go down
- in the evening, people return home and go up to their flats

2. the above schema is also true for offices but works in a reverse order
3. there are several frustrations when using elevators:

- waiting too long for the elevator to arrive
- going up to fetch another person before descending to the desired floor
- not being able to enter an elevator that is full of people

## My goals

For the project, I decided to code a solution in Typescript that:

1. :globe_with_meridians: is written in English, not Polish
2. :fire: addresses all of the above observations
3. :rocket: Works both in a Node.js and a browser environment
4. :lipstick: has a nice web UI

## Project structure

The project consists of 3 parts:

1. The actual algorithm located in ./src/algorithm
2. A React + Material UI + Vite web app that allows to use the algo in the browser
3. A sample test suite for playing with the algo through the command line

## Algorithm's details

The full algorithm, located in ./src/algorithm folder, features comments explaining each part of the code, and can by use by importing and creating an instance of the ElevatorSystem class from ./src/algorithm/index.ts

The most important components of the algo:

### Call class - models/Call.ts

It symbolizes a request of a passenger. There are 2 types of calls:

- entry Call - on which floor a person wants to enter the elevator
- exit Call - on which floor a person wants to exit the elevator

A call also has a direction, either up or down

Moreover, there are 3 possible priorities of calls:

1. Priority 0 (served first) - the person is waiting above the elevator that is going up
2. Priority 1 - the person wants to go down, and the elevator is going down
3. Priority 2 (served last) - the person wants to go up but is below the elevator that is going down

### The scheduler - scheduler/index.ts

The function that allocates elevators to the waiting passengers. It simulates how long it would take each elevator to get to the waiting passenger and chooses the lift with the shortest time

### The elevator logic - models/Elevator.ts

The way the elevator chooses which calls to serve and in what order is handled with a priority heap queue (defined in utils/PriorityQueue.ts) which keeps the most important requests at the top. The elevator serves calls one by one, but It can also resolve similar requests at the same time (it knows that several people can enter or leave the elevator at the same time).

The elevator can follow 2 different strategies while staying idle and waiting:

1. The BEFORE_ADTERNOON strategy - during this part of the day people usually go down in order to leave the building, therefore the elevators, when idle, are spread evenly around different floors. Thanks to this displacement, they can handle plenty of traffic from various floors
2. The AFTER_ADTERNOON strategy - during this part of the day, people usually return home and go up the floor to their flats, therefore the elevators, wait for the on floor zero.

Please, feel invited to view the full code in ./src/algorithm

## Run the web app

1. Install Node.js v20 or newer
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
- allows changing most of the algorithm's settings

The structure of the web app:

1. The canvas
   - it is an HTML table that has 3 + n columns, where n is the number of elevators
   - the 1st column shows the number of the floor
   - the 2nd column shows how many people are waiting for an elevator on each floor
   - the 3rd-(3+n-1)st columns show where each elevator currently is
   - the last column shows how many people are expected to arrive at each floor
2. The sidebar
   - allows starting, stopping and resetting the algorithm
   - allows generating passengers (also automatically)
   - allows changing the algorithm's settings (click the button to actually apply the settings)

## Run the project on the command line

Inside ./src/algorithm/index.test.ts there is a sample test where one can easily play with the algo through the command line

1. Install Node.js v20 or newer
2. Install dependencies

```bash
$ npm i
```

3. Run index.test.ts

```bash
$ npm run test
```

## Import the project in code

1. import the ElevatorSystem class and create and instance

```typescript
import { ElevatorSystem } from "./src/algorithm";

const building = new ElevatorSystem();
```

2. Specify how many floors you want

```typescript
const numberOfFloors = 20;

building.setFloors(numberOfFloors);
```

3. Specify how many elevators you want and create a config for the elevators

```typescript
import { type ElevatorConfigI, type DisplayDataI } from "./src/algorithm";

const numberOfElevators = 3;

async function displayElevator(d: DisplayDataI): Promise<void> {
  console.log(d);
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

4. Choose a strategy

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

1. :test_tube: proper unit tests for functions inside algorithm/models/Elevator.ts, algorithm/index.ts, algorithm/utils.ts
2. :test_tube: proper black box integration tests for the algorithm
3. :rocket: code coverage tests
4. :lipstick: prettier UI
5. :iphone: responsive design for mobile devices
6. :sparkles: support for floors below zero (i.e. underground parking lots)
7. :sparkles: let every elevator have different configurations (capacity, speed, etc.)
8. :test_tube: E2E tests for the web app
