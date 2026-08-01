"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import {
  selectCompletedWorldCount,
  selectCurrentWorldId,
  selectJourneyProgress,
  selectWorldProgress,
} from "./selectors";
import {
  createInitialJourneyState,
  journeyReducer,
} from "./state-machine";
import { journeyStorage } from "./storage";
import type { BadgeId, JourneyState, WorldId } from "./types";

type JourneyEngineValue = {
  state: JourneyState;
  hydrated: boolean;
  journeyProgress: number;
  completedWorldCount: number;
  currentWorldId: WorldId;
  startWorld: (worldId: WorldId) => void;
  setActiveWorld: (worldId: WorldId) => void;
  completeMission: (
    worldId: WorldId,
    missionId: string,
    xp: number,
  ) => void;
  completeWorld: (worldId: WorldId) => void;
  awardBadge: (badgeId: BadgeId, worldId?: WorldId) => void;
  getWorldProgress: (worldId: WorldId) => number;
  resetJourney: () => Promise<void>;
};

const JourneyEngineContext =
  createContext<JourneyEngineValue | null>(null);

export default function JourneyEngineProvider({
  children,
  learnerId = "local-learner",
}: {
  children: React.ReactNode;
  learnerId?: string;
}) {
  const [state, dispatch] = useReducer(
    journeyReducer,
    createInitialJourneyState(learnerId),
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let mounted = true;

    journeyStorage.load(learnerId).then((stored) => {
      if (!mounted) return;
      dispatch({ type: "HYDRATE", state: stored });
      setHydrated(true);
    });

    return () => {
      mounted = false;
    };
  }, [learnerId]);

  useEffect(() => {
    if (hydrated) void journeyStorage.save(state);
  }, [hydrated, state]);

  const startWorld = useCallback(
    (worldId: WorldId) =>
      dispatch({ type: "START_WORLD", worldId }),
    [],
  );

  const setActiveWorld = useCallback(
    (worldId: WorldId) =>
      dispatch({ type: "SET_ACTIVE_WORLD", worldId }),
    [],
  );

  const completeMission = useCallback(
    (worldId: WorldId, missionId: string, xp: number) =>
      dispatch({
        type: "COMPLETE_MISSION",
        worldId,
        missionId,
        xp,
      }),
    [],
  );

  const completeWorld = useCallback(
    (worldId: WorldId) =>
      dispatch({ type: "COMPLETE_WORLD", worldId }),
    [],
  );

  const awardBadge = useCallback(
    (badgeId: BadgeId, worldId?: WorldId) =>
      dispatch({ type: "AWARD_BADGE", badgeId, worldId }),
    [],
  );

  const getWorldProgress = useCallback(
    (worldId: WorldId) => selectWorldProgress(state, worldId),
    [state],
  );

  const resetJourney = useCallback(async () => {
    await journeyStorage.clear(learnerId);
    dispatch({ type: "RESET", learnerId });
  }, [learnerId]);

  const value = useMemo<JourneyEngineValue>(
    () => ({
      state,
      hydrated,
      journeyProgress: selectJourneyProgress(state),
      completedWorldCount: selectCompletedWorldCount(state),
      currentWorldId: selectCurrentWorldId(state),
      startWorld,
      setActiveWorld,
      completeMission,
      completeWorld,
      awardBadge,
      getWorldProgress,
      resetJourney,
    }),
    [
      awardBadge,
      completeMission,
      completeWorld,
      getWorldProgress,
      hydrated,
      resetJourney,
      setActiveWorld,
      startWorld,
      state,
    ],
  );

  return (
    <JourneyEngineContext.Provider value={value}>
      {children}
    </JourneyEngineContext.Provider>
  );
}

export function useJourneyEngine() {
  const context = useContext(JourneyEngineContext);

  if (!context) {
    throw new Error(
      "useJourneyEngine must be used within JourneyEngineProvider",
    );
  }

  return context;
}
