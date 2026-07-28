import { createInitialJourneyState } from "./state-machine";
import type { JourneyState } from "./types";

const PREFIX = "bayan:arabic-b:journey:v1";

export interface JourneyStorageAdapter {
  load(learnerId: string): Promise<JourneyState>;
  save(state: JourneyState): Promise<void>;
  clear(learnerId: string): Promise<void>;
}

export class LocalJourneyStorage
  implements JourneyStorageAdapter
{
  private key(learnerId: string) {
    return `${PREFIX}:${learnerId}`;
  }

  async load(learnerId: string): Promise<JourneyState> {
    if (typeof window === "undefined") {
      return createInitialJourneyState(learnerId);
    }

    try {
      const raw = window.localStorage.getItem(this.key(learnerId));
      if (!raw) return createInitialJourneyState(learnerId);

      const parsed = JSON.parse(raw) as JourneyState;
      return parsed.schemaVersion === 1
        ? parsed
        : createInitialJourneyState(learnerId);
    } catch {
      return createInitialJourneyState(learnerId);
    }
  }

  async save(state: JourneyState) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      this.key(state.learnerId),
      JSON.stringify(state),
    );
  }

  async clear(learnerId: string) {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(this.key(learnerId));
  }
}

export const journeyStorage = new LocalJourneyStorage();
