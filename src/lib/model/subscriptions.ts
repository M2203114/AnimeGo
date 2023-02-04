import { writable } from 'svelte/store';
import { Store } from 'tauri-plugin-store-api';
import type { Anime } from './Anime';

const store = new Store('.subscriptions.dat');

function createSubscriptions() {
  const { subscribe, set, update } = writable<Anime[]>([]);
  return {
    subscribe,
    set: async (subscriptions: Anime[]) => {
      set(subscriptions);
      await store.set('subscriptions', subscriptions);
    },
    add: (anime: Anime) => {
      update(subscriptions => {
        const result = [anime, ...subscriptions.filter(i => i.id !== anime.id)];
        store.set('subscriptions', result);
        return result;
      });
    },
    remove: (anime: Anime) => {
      update(subscriptions => {
        const result = subscriptions.filter(i => i.id !== anime.id);
        store.set('subscriptions', result);
        return result;
      });
    },
    initialize: async () => {
      const data = await store.get<Anime[]>('subscriptions');
      if (data) {
        set(data);
      } else {
        await store.set('subscriptions', []);
      }
    }
  };
}

export const subscriptions = await createSubscriptions();

function createUnwatchedSubscriptions() {
  const { subscribe, set } = writable<{ anime: Anime; newEpisodes: number }[]>(
    []
  );
  return {
    subscribe,
    set: async (subscriptions: { anime: Anime; newEpisodes: number }[]) => {
      set(subscriptions);
      await store.set('activeSubscriptions', subscriptions);
    },
    add: async (anime: { anime: Anime; newEpisodes: number }) => {
      const subscriptions = await store.get<
        { anime: Anime; newEpisodes: number }[]
      >('activeSubscriptions');
      const result = [
        anime,
        ...(subscriptions?.filter(a => a.anime.id !== anime.anime.id) ?? [])
      ];
      set(result);
      await store.set('activeSubscriptions', result);
    },
    remove: async (anime: { anime: Anime; newEpisodes: number }) => {
      const subscriptions = await store.get<
        { anime: Anime; newEpisodes: number }[]
      >('activeSubscriptions');
      const result =
        subscriptions?.filter(a => a.anime.id !== anime.anime.id) ?? [];
      set(result);
      await store.set('activeSubscriptions', result);
    },
    initialize: async () => {
      const data = await store.get<{ anime: Anime; newEpisodes: number }[]>(
        'activeSubscriptions'
      );
      if (data) {
        set(data);
      } else {
        await store.set('activeSubscriptions', []);
      }
    }
  };
}

export const unwatchedSubscriptions = await createUnwatchedSubscriptions();
