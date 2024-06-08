import { useSyncExternalStore } from "react";
import { Strategies } from "../algorithm/utils";

export interface SettingsI {
  floors: number;
  elevators: number;
  capacity: number;
  speed: number;
  ready: boolean;
  strategy: Strategies;
}

function createStore<T extends object>(initialStore: T): [() => T, (newStore: T | ((x: T) => T)) => void] {
  let store = initialStore;
  const listeners: Set<any> = new Set();

  const getStore = () => store;

  const dispatch = (newStore: T | ((x: T) => T)) => {
    // Make it like reacts setState so if you pass in a function you can get the store value first
    store = typeof newStore === "function" ? newStore(store) : newStore;
    listeners.forEach(listener => listener(() => store));
  };

  const subscribe = (listener: any) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const useStore = () => {
    return useSyncExternalStore(subscribe, getStore);
  };

  return [useStore, dispatch];
}

const [useSettings, setSettings] = createStore<SettingsI>({
  capacity: 5,
  floors: 12,
  elevators: 2,
  speed: 100,
  ready: false,
  strategy: Strategies.ZONING,
});

export { useSettings, setSettings };

const [useGeneratePerson, setGeneratePerson] = createStore({ from: 5, to: 0, ready: false });

export { useGeneratePerson, setGeneratePerson };

const [useStatus, setStatus] = createStore({ running: true });

export { useStatus, setStatus };
