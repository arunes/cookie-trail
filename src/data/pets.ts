import type { Pet } from './models';
import type { PetRow } from './database';
import { db } from './database';

export function getActivePet(): Pet {
    const activePet = db.getFirstSync<PetRow>("SELECT * FROM pets LIMIT 1");
    if (activePet) {
        return {
            id: activePet.id,
            name: activePet.name
        };
    }

    throw Error("No active pet found!");
}